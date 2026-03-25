import type express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { LEO_CHAT_INSTRUCTIONS } from "./leoChatInstructions";
import {
  callOpenClawLeo,
  getOpenClawAgentModel,
  getOpenClawBaseUrl,
  getOpenClawGatewayToken,
} from "./openclawGateway";

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(32000),
});

const bodySchema = z.object({
  message: z.string().trim().min(1).max(12000),
  /** Omitted or null → []. Matches curl and clients that only send `message`. */
  history: z.array(chatTurnSchema).optional().transform(v => v ?? []),
  sessionId: z.preprocess(
    val => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    },
    z.string().min(8).max(128).optional()
  ),
});

const OFFLINE_MESSAGE = "Leo is temporarily offline. Please try again in a moment.";

function statusForOpenClawError(code: string): number {
  if (code === "gateway_unreachable") return 503;
  if (code === "missing_token") return 503;
  if (code === "openai_http_disabled") return 503;
  return 502;
}

/**
 * POST /api/leo-chat — proxy to OpenClaw Gateway (WebSocket first; HTTP uses chat completions / responses per openclawGateway). Secrets stay server-side.
 */
export function registerOpenclawLeoRoute(app: express.Express): void {
  app.post("/api/leo-chat", async (req, res) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        reply: OFFLINE_MESSAGE,
        error: "invalid_body",
        detail:
          "Request body must be JSON with `message` (non-empty string). `history` is optional (array of {role, content}, default []). `sessionId` is optional (8–128 chars).",
      });
      return;
    }

    const token = getOpenClawGatewayToken();
    if (!token) {
      console.error(
        "[/api/leo-chat] No OpenClaw bearer token: set OPENCLAW_GATEWAY_TOKEN (or OPENCLAW_TOKEN) in .env.local"
      );
      res.status(503).json({ reply: OFFLINE_MESSAGE, error: "missing_token" });
      return;
    }

    const baseUrl = getOpenClawBaseUrl();
    const model = getOpenClawAgentModel();
    const sessionUserKey = parsed.data.sessionId?.trim() || randomUUID();

    const { message, history } = parsed.data;

    const result = await callOpenClawLeo({
      baseUrl,
      token,
      model,
      instructions: LEO_CHAT_INSTRUCTIONS,
      message,
      history,
      sessionUserKey,
      requireChatCompletionsPreflight: process.env.OPENCLAW_HEALTH_CHECK === "true",
    });

    if (result.ok) {
      res.json({ reply: result.reply });
      return;
    }

    console.error("[/api/leo-chat] OpenClaw error", result.error, result.detail ?? "");
    res.status(statusForOpenClawError(result.error)).json({
      reply: OFFLINE_MESSAGE,
      error: result.error,
      ...(result.detail ? { detail: result.detail } : {}),
    });
  });
}
