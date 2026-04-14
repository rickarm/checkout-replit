import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// GET /auth/google/status — stub that reports connected
// The api-server uses PostgreSQL for storage, so Google Drive OAuth
// is not needed. Return connected: true to unblock the frontend.
router.get("/status", requireAuth, (_req, res) => {
  res.json({ connected: true, folderId: null });
});

// GET /auth/google/connect — not implemented (postgres backend)
router.get("/connect", (_req, res) => {
  res.status(501).json({
    error:
      "Google Drive integration is not available. Entries are stored in the database.",
  });
});

// GET /auth/google/callback — not implemented (postgres backend)
router.get("/callback", (_req, res) => {
  res.status(501).json({
    error:
      "Google Drive integration is not available. Entries are stored in the database.",
  });
});

export default router;
