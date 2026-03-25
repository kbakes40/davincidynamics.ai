/**
 * Next.js App Router handler (reference / future migration).
 * This repo runs the same logic on Express: server/chat/anthropicChatRoute.ts → POST /api/chat
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: systemPrompt,
      messages: messages,
    }),
  });

  const data = await res.json();
  const content = data.content?.[0]?.text ?? "Sorry, I couldn't respond.";
  return NextResponse.json({ content });
}
