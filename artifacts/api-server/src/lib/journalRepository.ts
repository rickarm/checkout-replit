/**
 * Journal Repository — Mock Implementation (per-user scoped)
 *
 * This is the integration seam. When the Phase 1 refactor (shared service layer)
 * is complete, replace this file with a real JournalRepository that talks to
 * the chosen storage backend (local files, Google Drive, etc.).
 *
 * The interface contract (listEntries, getEntry, createEntry, updateEntry,
 * getSettings, updateSettings) should remain stable.
 *
 * Each function accepts a userId so that data is fully scoped per user.
 */

import { randomUUID } from "crypto";
import { mockEntries, mockSettings, DAILY_PROMPTS } from "./journalMockData.js";
import type { JournalEntry, StorageSettings, PromptAnswer } from "./journalTypes.js";

// Per-user in-memory stores
const userEntries = new Map<string, JournalEntry[]>();
const userSettings = new Map<string, StorageSettings>();

function getUserEntries(userId: string): JournalEntry[] {
  if (!userEntries.has(userId)) {
    // Seed new users with a clean slate (no mock entries in real usage)
    userEntries.set(userId, []);
  }
  return userEntries.get(userId)!;
}

function getUserSettings(userId: string): StorageSettings {
  if (!userSettings.has(userId)) {
    userSettings.set(userId, { ...mockSettings });
  }
  return userSettings.get(userId)!;
}

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

export const journalRepository = {
  listEntries(userId: string, params?: { month?: string; search?: string }): JournalEntry[] {
    let result = [...getUserEntries(userId)].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (params?.month) {
      result = result.filter((e) => e.date.startsWith(params.month!));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.date.includes(q) ||
          e.answers.some((a) => a.answer.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getEntry(userId: string, id: string): JournalEntry | undefined {
    return getUserEntries(userId).find((e) => e.id === id);
  },

  createEntry(
    userId: string,
    data: { date: string; template?: string; answers: PromptAnswer[] }
  ): JournalEntry {
    const entries = getUserEntries(userId);
    const now = new Date().toISOString();
    const answersWithPrompts = data.answers.map((a) => {
      const prompt = DAILY_PROMPTS.find((p) => p.promptId === a.promptId);
      return {
        ...a,
        promptText: a.promptText || prompt?.promptText || a.promptId,
      };
    });

    const entry: JournalEntry = {
      id: `entry-${randomUUID()}`,
      date: data.date,
      template: data.template ?? "daily-reflection",
      answers: answersWithPrompts,
      markdown: buildMarkdown(data.date, answersWithPrompts),
      createdAt: now,
      updatedAt: now,
      source: { backend: "mock", path: `${data.date}.md` },
    };
    entries.unshift(entry);
    return entry;
  },

  updateEntry(
    userId: string,
    id: string,
    data: { answers: PromptAnswer[]; markdown?: string }
  ): JournalEntry | undefined {
    const entries = getUserEntries(userId);
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;

    const existing = entries[idx];
    const now = new Date().toISOString();
    const updated: JournalEntry = {
      ...existing,
      answers: data.answers,
      markdown: data.markdown ?? buildMarkdown(existing.date, data.answers),
      updatedAt: now,
    };
    entries[idx] = updated;
    return updated;
  },

  getSummary(userId: string) {
    return computeSummary(getUserEntries(userId));
  },

  getSettings(userId: string): StorageSettings {
    return { ...getUserSettings(userId) };
  },

  updateSettings(userId: string, data: Partial<StorageSettings>): StorageSettings {
    const current = getUserSettings(userId);
    const updated = { ...current, ...data };
    userSettings.set(userId, updated);
    return { ...updated };
  },
};
