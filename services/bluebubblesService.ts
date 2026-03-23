/**
 * BlueBubbles server client — internal Kevin follow-up SMS/iMessage.
 * API path is a skeleton; align with your BlueBubbles private API documentation.
 */

import { isBlueBubblesFollowupEnabled } from "../config/env";

export type SendBlueBubblesParams = {
  phoneNumber: string;
  message: string;
  fromHandle: string;
};

export function assertBlueBubblesEnv(): void {
  if (!isBlueBubblesFollowupEnabled()) {
    throw new Error("BlueBubbles follow-up is not enabled (BLUEBUBBLES_FOLLOWUP_ENABLED).");
  }
  const base = process.env.BLUEBUBBLES_SERVER_URL?.trim();
  const password = process.env.BLUEBUBBLES_PASSWORD?.trim();
  const handle = process.env.BLUEBUBBLES_FROM_HANDLE?.trim();
  if (!base || !password || !handle) {
    throw new Error("BlueBubbles env incomplete: SERVER_URL, PASSWORD, FROM_HANDLE required.");
  }
}

export function buildBlueBubblesHeaders(): Record<string, string> {
  assertBlueBubblesEnv();
  const password = process.env.BLUEBUBBLES_PASSWORD!.trim();
  return {
    "Content-Type": "application/json",
    // Common pattern: API key or basic-style header — adjust to your BlueBubbles server.
    Authorization: `Bearer ${password}`,
  };
}

export type BlueBubblesSendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

/**
 * Send a text via BlueBubbles. Adjust `path` and body to match your server’s API.
 */
export async function sendBlueBubblesText(params: SendBlueBubblesParams): Promise<BlueBubblesSendResult> {
  try {
    assertBlueBubblesEnv();
    const base = process.env.BLUEBUBBLES_SERVER_URL!.replace(/\/$/, "");
    // TODO(production): replace with your BlueBubbles REST route (e.g. /api/v1/chat/send).
    const url = `${base}/api/v1/message/text`;
    const body = {
      to: params.phoneNumber,
      text: params.message,
      from: params.fromHandle,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: buildBlueBubblesHeaders(),
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let parsed: { messageId?: string; id?: string; error?: string } = {};
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      /* non-JSON response */
    }

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${raw.slice(0, 500)}` };
    }

    const messageId = parsed.messageId ?? parsed.id ?? `bb_${Date.now()}`;
    return { ok: true, messageId: String(messageId) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
