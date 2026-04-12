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

// Extend Express Request to carry userId
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

journalRouter.get("/entries", (req, res) => {
  const parseResult = ListEntriesQueryParams.safeParse(req.query);
  const params = parseResult.success ? parseResult.data : {};
  const entries = journalRepository.listEntries(req.userId!, params);
  res.json(entries);
});

journalRouter.post("/entries", (req, res) => {
  const parseResult = CreateEntryBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const entry = journalRepository.createEntry(req.userId!, parseResult.data);
  res.status(201).json(entry);
});

journalRouter.get("/entries/:id", (req, res) => {
  const parseResult = GetEntryParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid entry id" });
    return;
  }
  const entry = journalRepository.getEntry(req.userId!, parseResult.data.id);
  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(entry);
});

journalRouter.put("/entries/:id", (req, res) => {
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
  const entry = journalRepository.updateEntry(req.userId!, paramsResult.data.id, bodyResult.data);
  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(entry);
});

journalRouter.get("/summary", (req, res) => {
  const summary = journalRepository.getSummary(req.userId!);
  res.json(summary);
});

journalRouter.get("/settings", (req, res) => {
  const settings = journalRepository.getSettings(req.userId!);
  res.json(settings);
});

journalRouter.put("/settings", (req, res) => {
  const parseResult = UpdateStorageSettingsBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const settings = journalRepository.updateSettings(req.userId!, parseResult.data);
  res.json(settings);
});
