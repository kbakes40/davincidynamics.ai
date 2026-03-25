import type express from "express";
import { z } from "zod";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(12000),
    })
  ),
  systemPrompt: z.string().max(20000),
});

const DEFAULT_MODEL = "gpt-4o";

/**
 * POST /api/chat — proxies to OpenAI Chat Completions (API key stays server-side).
 */
export function registerOpenAIChatRoute(app: express.Express): void {
  app.post("/api/chat", async (req, res) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({ error: "OPENAI_API_KEY is not configured" });
      return;
    }

    const { messages, systemPrompt } = parsed.data;
    const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

    const openaiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    try {
      const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          messages: openaiMessages,
        }),
      });

      const raw = await apiRes.text();
      if (!apiRes.ok) {
        console.error("[/api/chat] OpenAI error", apiRes.status, raw.slice(0, 500));
        res.status(502).json({ error: "Upstream error" });
        return;
      }

      const data = JSON.parse(raw) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        res.status(502).json({ error: "Empty response" });
        return;
      }

      res.json({ content: text });
    } catch (e) {
      console.error("[/api/chat]", e);
      res.status(500).json({ error: "Internal error" });
    }
  });
}
