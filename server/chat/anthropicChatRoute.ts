import type express from "express";

/**
 * POST /api/chat — Anthropic Messages API (same contract as app/api/chat/route.ts for Next.js).
 */
export function registerAnthropicChatRoute(app: express.Express): void {
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body ?? {};

      const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
      if (!apiKey) {
        res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured" });
        return;
      }

      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: systemPrompt,
          messages,
        }),
      });

      const data = (await upstream.json()) as {
        content?: Array<{ text?: string }>;
        error?: { message?: string };
      };

      if (!upstream.ok) {
        console.error("[/api/chat] Anthropic error", upstream.status, data);
        res.status(502).json({ error: "Upstream error" });
        return;
      }

      const content = data.content?.[0]?.text ?? "Sorry, I couldn't respond.";
      res.json({ content });
    } catch (e) {
      console.error("[/api/chat]", e);
      res.status(500).json({ error: "Internal error" });
    }
  });
}
