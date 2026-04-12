/**
 * Journal Repository — PostgreSQL Implementation (per-user scoped)
 *
 * Replaces the in-memory mock. The integration seam contract is unchanged:
 * every function accepts userId as the first argument.
 *
 * Schema lives in two tables:
 *   journal_entries  — one row per entry, answers stored as JSONB
 *   journal_settings — one row per user
 */

import pg from "pg";
import { randomUUID } from "crypto";
import { mockSettings, DAILY_PROMPTS } from "./journalMockData.js";
import type { JournalEntry, StorageSettings, PromptAnswer } from "./journalTypes.js";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildMarkdown(date: string, answers: PromptAnswer[]): string {
  const dateLabel = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sections = answers
    .map((a) => `**${a.promptText}**\n\n${a.answer}`)
    .join("\n\n---\n\n");
  return `# ${dateLabel}\n\n${sections}`;
}

function rowToEntry(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    date: (row.date as Date).toISOString().slice(0, 10),
    template: row.template as string,
    answers: row.answers as PromptAnswer[],
    markdown: row.markdown as string,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    source: (row.source as { backend: "postgres" }) ?? { backend: "postgres" },
  };
}

function computeSummary(entries: JournalEntry[]) {
  const total = entries.length;
  const months = [...new Set(entries.map((e) => e.date.slice(0, 7)))].sort().reverse();

  const presenceAnswers = entries
    .map((e) => e.answers.find((a) => a.promptId === "presence"))
    .filter(Boolean)
    .map((a) => parseFloat(a!.answer))
    .filter((n) => !isNaN(n));

  const avg =
    presenceAnswers.length > 0
      ? parseFloat(
          (presenceAnswers.reduce((s, n) => s + n, 0) / presenceAnswers.length).toFixed(1)
        )
      : 0;

  const sortedDates = entries.map((e) => e.date).sort();
  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = sortedDates[sortedDates.length - 1];
  const daysSinceLast = lastDate
    ? Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const currentStreak = daysSinceLast <= 1 ? streak : 0;

  return {
    totalEntries: total,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    activeMonths: months,
    averagePresenceScore: avg,
  };
}

// ── Repository ───────────────────────────────────────────────────────────────

export const journalRepository = {
  async listEntries(
    userId: string,
    params?: { month?: string; search?: string }
  ): Promise<JournalEntry[]> {
    let query = `SELECT * FROM journal_entries WHERE user_id = $1`;
    const values: unknown[] = [userId];

    if (params?.month) {
      values.push(params.month + "%");
      query += ` AND date::text LIKE $${values.length}`;
    }

    if (params?.search) {
      const q = "%" + params.search.toLowerCase() + "%";
      values.push(q);
      query += ` AND (date::text ILIKE $${values.length} OR answers::text ILIKE $${values.length})`;
    }

    query += ` ORDER BY date DESC`;

    const { rows } = await pool.query(query, values);
    return rows.map(rowToEntry);
  },

  async getEntry(userId: string, id: string): Promise<JournalEntry | undefined> {
    const { rows } = await pool.query(
      `SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows.length ? rowToEntry(rows[0]) : undefined;
  },

  async createEntry(
    userId: string,
    data: { date: string; template?: string; answers: PromptAnswer[] }
  ): Promise<JournalEntry> {
    const id = `entry-${randomUUID()}`;
    const now = new Date();
    const answersWithPrompts = data.answers.map((a) => {
      const prompt = DAILY_PROMPTS.find((p) => p.promptId === a.promptId);
      return { ...a, promptText: a.promptText || prompt?.promptText || a.promptId };
    });
    const markdown = buildMarkdown(data.date, answersWithPrompts);
    const template = data.template ?? "daily-reflection";
    const source = { backend: "postgres" };

    const { rows } = await pool.query(
      `INSERT INTO journal_entries (id, user_id, date, template, answers, markdown, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       RETURNING *`,
      [id, userId, data.date, template, JSON.stringify(answersWithPrompts), markdown, JSON.stringify(source), now]
    );
    return rowToEntry(rows[0]);
  },

  async updateEntry(
    userId: string,
    id: string,
    data: { answers: PromptAnswer[]; markdown?: string }
  ): Promise<JournalEntry | undefined> {
    const existing = await this.getEntry(userId, id);
    if (!existing) return undefined;

    const markdown = data.markdown ?? buildMarkdown(existing.date, data.answers);
    const now = new Date();

    const { rows } = await pool.query(
      `UPDATE journal_entries
       SET answers = $1, markdown = $2, updated_at = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [JSON.stringify(data.answers), markdown, now, id, userId]
    );
    return rows.length ? rowToEntry(rows[0]) : undefined;
  },

  async getSummary(userId: string) {
    const entries = await this.listEntries(userId);
    return computeSummary(entries);
  },

  async getSettings(userId: string): Promise<StorageSettings> {
    const { rows } = await pool.query(
      `SELECT * FROM journal_settings WHERE user_id = $1`,
      [userId]
    );
    if (!rows.length) {
      return { ...mockSettings };
    }
    return {
      backend: "postgres",
      personalValues: rows[0].personal_values ?? [],
    };
  },

  async updateSettings(userId: string, data: Partial<StorageSettings>): Promise<StorageSettings> {
    const current = await this.getSettings(userId);
    const merged = { ...current, ...data };
    const personalValues = merged.personalValues ?? [];

    await pool.query(
      `INSERT INTO journal_settings (user_id, personal_values, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET personal_values = EXCLUDED.personal_values,
             updated_at = NOW()`,
      [userId, personalValues]
    );

    return merged;
  },
};
