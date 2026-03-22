import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { processTelegramWebhook } from "../telegram-webhook";

/**
 * Express app with API routes only. Caller attaches Vite (dev) or static (prod).
 */
export function createApp(): express.Express {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.post("/api/telegram-handoff-webhook", async (req, res) => {
    try {
      console.log("[Handoff Webhook] Received request");
      const result = await processTelegramWebhook(req.body);
      res.json(result);
    } catch (error) {
      console.error("[Handoff Webhook] Error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}

