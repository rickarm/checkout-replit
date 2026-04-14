import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { journalRepository } from "../lib/journalRepository.js";
import { DAILY_PROMPTS } from "../lib/journalMockData.js";
import type { PromptAnswer } from "../lib/journalTypes.js";

export const journalRouter = Router();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

/**
 * Convert flat answers Record<string, string> to PromptAnswer[].
 * Uses DAILY_PROMPTS for promptText lookup, falls back to promptId.
 */
function flatAnswersToPromptAnswers(
  flat: Record<string, string>,
): PromptAnswer[] {
  return Object.entries(flat).map(([key, value]) => {
    const prompt = DAILY_PROMPTS.find((p) => p.promptId === key);
    return {
      promptId: key,
      promptText: prompt?.promptText ?? key,
      answer: String(value),
    };
  });
}

journalRouter.use(requireAuth);

// GET /entries — list entries as { entries: EntrySummary[] }
journalRouter.get("/entries", async (req, res) => {
  try {
    const params: { month?: string; search?: string } = {};
    if (typeof req.query.month === "string") params.month = req.query.month;
    if (typeof req.query.search === "string") params.search = req.query.search;

    const entries = await journalRepository.listEntries(req.userId!, params);

    res.json({
      entries: entries.map((e) => ({
        id: e.id,
        date: e.date,
        templateId: e.template,
        mtime: e.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to list entries" });
  }
});

// POST /entries — create entry from frontend format
// Frontend sends: { date, templateId, answers: Record<string, string> }
journalRouter.post("/entries", async (req, res) => {
  try {
    const { date, templateId, answers } = req.body;

    if (!date || !answers || typeof answers !== "object") {
      res.status(400).json({ error: "date and answers are required" });
      return;
    }

    const promptAnswers = Array.isArray(answers)
      ? answers
      : flatAnswersToPromptAnswers(answers);

    const entry = await journalRepository.createEntry(req.userId!, {
      date,
      template: templateId ?? "daily-reflection",
      answers: promptAnswers,
    });

    // Return EntrySummary shape
    res.status(201).json({
      id: entry.id,
      date: entry.date,
      templateId: entry.template,
      mtime: entry.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// GET /entries/:id — get entry detail as EntryDetail
journalRouter.get("/entries/:id", async (req, res) => {
  try {
    const entry = await journalRepository.getEntry(req.userId!, req.params.id);
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    res.json({
      id: entry.id,
      date: entry.date,
      templateId: entry.template,
      markdown: entry.markdown,
      sections: entry.answers.map((a) => ({
        title: a.promptText,
        content: a.answer,
      })),
      metadata: { createdAt: entry.createdAt, updatedAt: entry.updatedAt },
      source: entry.source,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get entry" });
  }
});

// PUT /entries/:id — update entry (internal PromptAnswer[] format)
journalRouter.put("/entries/:id", async (req, res) => {
  try {
    const { answers, markdown } = req.body;
    if (!answers) {
      res.status(400).json({ error: "answers are required" });
      return;
    }

    const promptAnswers = Array.isArray(answers)
      ? answers
      : flatAnswersToPromptAnswers(answers);

    const entry = await journalRepository.updateEntry(
      req.userId!,
      req.params.id,
      { answers: promptAnswers, markdown },
    );
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    res.json({
      id: entry.id,
      date: entry.date,
      templateId: entry.template,
      markdown: entry.markdown,
      sections: entry.answers.map((a) => ({
        title: a.promptText,
        content: a.answer,
      })),
      metadata: { createdAt: entry.createdAt, updatedAt: entry.updatedAt },
      source: entry.source,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// PATCH /entries/:id — update entry (frontend flat answers format)
// Frontend sends: { answers: Record<string, string> }
journalRouter.patch("/entries/:id", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      res.status(400).json({ error: "answers are required" });
      return;
    }

    const promptAnswers = Array.isArray(answers)
      ? answers
      : flatAnswersToPromptAnswers(answers);

    const entry = await journalRepository.updateEntry(
      req.userId!,
      req.params.id,
      { answers: promptAnswers },
    );
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    res.json({
      id: entry.id,
      date: entry.date,
      templateId: entry.template,
      markdown: entry.markdown,
      sections: entry.answers.map((a) => ({
        title: a.promptText,
        content: a.answer,
      })),
      metadata: { createdAt: entry.createdAt, updatedAt: entry.updatedAt },
      source: entry.source,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// GET /summary
journalRouter.get("/summary", async (req, res) => {
  try {
    const summary = await journalRepository.getSummary(req.userId!);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to get summary" });
  }
});

// GET /settings
journalRouter.get("/settings", async (req, res) => {
  try {
    const settings = await journalRepository.getSettings(req.userId!);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to get settings" });
  }
});

// PUT /settings
journalRouter.put("/settings", async (req, res) => {
  try {
    const settings = await journalRepository.updateSettings(
      req.userId!,
      req.body,
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
