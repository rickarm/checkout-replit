import { Router } from "express";
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

journalRouter.get("/entries", (req, res) => {
  const parseResult = ListEntriesQueryParams.safeParse(req.query);
  const params = parseResult.success ? parseResult.data : {};
  const entries = journalRepository.listEntries(params);
  res.json(entries);
});

journalRouter.post("/entries", (req, res) => {
  const parseResult = CreateEntryBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const entry = journalRepository.createEntry(parseResult.data);
  res.status(201).json(entry);
});

journalRouter.get("/entries/:id", (req, res) => {
  const parseResult = GetEntryParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid entry id" });
    return;
  }
  const entry = journalRepository.getEntry(parseResult.data.id);
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
  const entry = journalRepository.updateEntry(paramsResult.data.id, bodyResult.data);
  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(entry);
});

journalRouter.get("/summary", (_req, res) => {
  const summary = journalRepository.getSummary();
  res.json(summary);
});

journalRouter.get("/settings", (_req, res) => {
  const settings = journalRepository.getSettings();
  res.json(settings);
});

journalRouter.put("/settings", (req, res) => {
  const parseResult = UpdateStorageSettingsBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const settings = journalRepository.updateSettings(parseResult.data);
  res.json(settings);
});
