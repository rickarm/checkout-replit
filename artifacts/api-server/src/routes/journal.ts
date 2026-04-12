import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { journalRepository } from "../lib/journalRepository.js";
import {
  ListEntriesQueryParams,
  CreateEntryBody,
  GetEntryParams,
  UpdateEntryParams,
  UpdateEntryBody,
  UpdateStorageSettingsBody,
} from "@workspace/api-zod";

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

journalRouter.use(requireAuth);

journalRouter.get("/entries", async (req, res) => {
  try {
    const parseResult = ListEntriesQueryParams.safeParse(req.query);
    const params = parseResult.success ? parseResult.data : {};
    const entries = await journalRepository.listEntries(req.userId!, params);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to list entries" });
  }
});

journalRouter.post("/entries", async (req, res) => {
  try {
    const parseResult = CreateEntryBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.message });
      return;
    }
    const entry = await journalRepository.createEntry(req.userId!, parseResult.data);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to create entry" });
  }
});

journalRouter.get("/entries/:id", async (req, res) => {
  try {
    const parseResult = GetEntryParams.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid entry id" });
      return;
    }
    const entry = await journalRepository.getEntry(req.userId!, parseResult.data.id);
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to get entry" });
  }
});

journalRouter.put("/entries/:id", async (req, res) => {
  try {
    const paramsResult = UpdateEntryParams.safeParse(req.params);
    if (!paramsResult.success) {
      res.status(400).json({ error: "Invalid entry id" });
      return;
    }
    const bodyResult = UpdateEntryBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.message });
      return;
    }
    const entry = await journalRepository.updateEntry(
      req.userId!,
      paramsResult.data.id,
      bodyResult.data
    );
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

journalRouter.get("/summary", async (req, res) => {
  try {
    const summary = await journalRepository.getSummary(req.userId!);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to get summary" });
  }
});

journalRouter.get("/settings", async (req, res) => {
  try {
    const settings = await journalRepository.getSettings(req.userId!);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to get settings" });
  }
});

journalRouter.put("/settings", async (req, res) => {
  try {
    const parseResult = UpdateStorageSettingsBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.message });
      return;
    }
    const settings = await journalRepository.updateSettings(req.userId!, parseResult.data);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
