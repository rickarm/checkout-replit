import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/debug-env", (_req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
    clerkSecretKeyLength: process.env.CLERK_SECRET_KEY?.length ?? 0,
    hasClerkPublishableKey: !!process.env.CLERK_PUBLISHABLE_KEY,
    hasViteClerkPublishableKey: !!process.env.VITE_CLERK_PUBLISHABLE_KEY,
    timestamp: new Date().toISOString(),
  });
});

export default router;
