import type { RequestHandler } from "express";

const CLERK_FAPI = "https://frontend-api.clerk.dev";
export const CLERK_PROXY_PATH = "/api/__clerk";

export function clerkProxyMiddleware(): RequestHandler {
  return async (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "clerkProxyMiddleware: CLERK_SECRET_KEY is not set — returning 503",
      );
      res.status(503).json({ error: "Auth proxy not configured" });
      return;
    }

    try {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "";
      const proxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;

      const targetPath = req.originalUrl.replace(
        new RegExp(`^${CLERK_PROXY_PATH}`),
        "",
      );
      const targetUrl = `${CLERK_FAPI}${targetPath}`;

      const xff = req.headers["x-forwarded-for"];
      const clientIp =
        (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "";

      const headers: Record<string, string> = {
        "Clerk-Proxy-Url": proxyUrl,
        "Clerk-Secret-Key": secretKey,
      };

      if (clientIp) {
        headers["X-Forwarded-For"] = clientIp;
      }

      for (const [key, value] of Object.entries(req.headers)) {
        if (
          key === "host" ||
          key === "connection" ||
          key === "clerk-proxy-url" ||
          key === "clerk-secret-key"
        )
          continue;
        if (typeof value === "string") {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(", ");
        }
      }

      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      await new Promise<void>((resolve) => req.on("end", resolve));
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers,
        body:
          body && req.method !== "GET" && req.method !== "HEAD"
            ? body
            : undefined,
      });

      res.status(upstream.status);

      const skipHeaders = new Set([
        "transfer-encoding",
        "connection",
        "keep-alive",
        "content-encoding",
      ]);
      upstream.headers.forEach((value, key) => {
        if (!skipHeaders.has(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      const responseBody = await upstream.arrayBuffer();
      res.send(Buffer.from(responseBody));
    } catch (err) {
      console.error("Clerk proxy error:", err);
      res.status(502).json({ error: "Clerk proxy unavailable" });
    }
  };
}
