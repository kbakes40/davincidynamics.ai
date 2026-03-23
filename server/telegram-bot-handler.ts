/**
 * Integrated Telegram Bot Handler (Webhook-based)
 * Customer-facing: @VinciDynamicsBot (TELEGRAM_BOT_TOKEN)
 */

import type { Express, Request, Response, RequestHandler } from 'express';
import { botAI } from './bot-ai-handler';
import { scheduleDeleteVinciClosingMessage } from './vinci-leo-handoff';

/** Customer bot token — never log or expose this value. */
function getTelegramBotToken(): string | undefined {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t || undefined;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

/** Dedupe keys must include chat_id — Telegram message_id is only unique per chat. */
const processedMessages = new Set<string>();

function messageDedupeKey(chatId: number, messageId: number): string {
  return `${chatId}:${messageId}`;
}

/**
 * Send message to Telegram user. Returns Telegram message_id when successful.
 */
async function sendMessage(chatId: number, text: string): Promise<number | undefined> {
  const token = getTelegramBotToken();
  if (!token) return undefined;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    const data = (await response.json()) as { ok?: boolean; result?: { message_id?: number } };

    if (!response.ok || !data.ok) {
      console.error('[Telegram Bot] Send message error:', data);
      return undefined;
    }
    return data.result?.message_id;
  } catch (error) {
    console.error('[Telegram Bot] Send message failed:', error);
    return undefined;
  }
}

/** Shared POST handler (some hosts forward `/api/...`, others strip the prefix). */
function createWebhookHandler(): RequestHandler {
  return async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body || typeof body !== "object") {
        res.status(400).send("Bad Request");
        return;
      }
      const update = body as TelegramUpdate;
      console.log("[Telegram Bot] Webhook update received:", update.update_id);

      if (update.message) {
        processMessage(update.message).catch((err) => {
          console.error("[Telegram Bot] Async process error:", err);
        });
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("[Telegram Bot] Webhook error:", error);
      res.status(500).send("Error");
    }
  };
}

/**
 * Long polling for local dev when no public HTTPS webhook is configured.
 * Deletes any existing webhook so Telegram delivers updates here.
 */
function startLongPolling(token: string): void {
  void (async () => {
    try {
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drop_pending_updates: false }),
      });
    } catch {
      /* ignore */
    }

    console.log(
      "[Telegram Bot] Long polling active (dev). Set TELEGRAM_WEBHOOK_BASE_URL + redeploy for production webhooks."
    );

    let offset = 0;
    for (;;) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offset,
            timeout: 25,
            allowed_updates: ["message"],
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          result?: Array<{ update_id: number; message?: TelegramUpdate["message"] }>;
        };
        if (!data.ok || !Array.isArray(data.result)) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        for (const u of data.result) {
          offset = u.update_id + 1;
          if (u.message) {
            processMessage(u.message).catch((err) => {
              console.error("[Telegram Bot] Poll process error:", err);
            });
          }
        }
      } catch (e) {
        console.error("[Telegram Bot] getUpdates error:", e);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  })();
}

function shouldUseLongPolling(): boolean {
  if (process.env.TELEGRAM_USE_POLLING === "1" || process.env.TELEGRAM_USE_POLLING === "true") {
    return true;
  }
  const base = process.env.TELEGRAM_WEBHOOK_BASE_URL?.trim();
  return process.env.NODE_ENV === "development" && !base;
}

/**
 * Process incoming message
 */
async function processMessage(message: TelegramUpdate['message']) {
  if (!message || !message.text || message.from.is_bot) return;
  
  const dedupeKey = messageDedupeKey(message.chat.id, message.message_id);
  if (processedMessages.has(dedupeKey)) {
    console.log(`[Telegram Bot] Skipping duplicate message ${dedupeKey}`);
    return;
  }
  processedMessages.add(dedupeKey);

  if (processedMessages.size > 1000) {
    const toDelete = Array.from(processedMessages).slice(0, 100);
    toDelete.forEach((k) => processedMessages.delete(k));
  }
  
  const chatId = message.chat.id;
  const userMessage = message.text;
  
  console.log(`[Telegram Bot] Message from ${message.from.first_name}: ${userMessage}`);
  
  try {
    // Use AI handler to generate response
    const response = await botAI.handleMessage(
      {
        id: message.from.id,
        username: message.from.username,
        first_name: message.from.first_name,
        last_name: message.from.last_name,
      },
      userMessage
    );

    const text = typeof response.message === 'string' ? response.message.trim() : '';
    if (text.length > 0) {
      const messageId = await sendMessage(chatId, response.message);
      if (response.vinciHandoffCompleted && messageId != null) {
        scheduleDeleteVinciClosingMessage(chatId, messageId);
      }
    }
  } catch (error) {
    console.error('[Telegram Bot] Process message error:', error);
    await sendMessage(chatId, "Sorry, I encountered an error. Please try again or contact support.");
  }
}

/**
 * Register Telegram webhook so updates reach this server.
 * Set TELEGRAM_WEBHOOK_BASE_URL (e.g. https://www.davincidynamics.ai) in production.
 */
async function ensureTelegramWebhookRegistered(token: string): Promise<void> {
  const base = process.env.TELEGRAM_WEBHOOK_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    console.warn(
      "[Telegram Bot] TELEGRAM_WEBHOOK_BASE_URL not set — use BotFather setWebhook manually, or updates may not arrive."
    );
    return;
  }
  const url = `${base}/api/telegram-webhook/${token}`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (data.ok) {
      console.log("[Telegram Bot] Webhook registered successfully for @VinciDynamicsBot");
    } else {
      console.error("[Telegram Bot] setWebhook failed:", {
        ok: data.ok,
        description: data.description,
      });
    }
  } catch (e) {
    console.error("[Telegram Bot] setWebhook error:", e);
  }
}

/**
 * Start the bot: webhook on Express, or long polling in local dev without TELEGRAM_WEBHOOK_BASE_URL.
 */
export function startTelegramBot(app: Express, publicUrl?: string) {
  const token = getTelegramBotToken();
  if (!token) {
    console.warn('[Telegram Bot] Skipping bot start - TELEGRAM_BOT_TOKEN not set');
    return;
  }

  if (shouldUseLongPolling()) {
    startLongPolling(token);
    return;
  }

  console.log('[Telegram Bot] Starting @VinciDynamicsBot (webhook)...');

  void ensureTelegramWebhookRegistered(token);

  const webhookHandler = createWebhookHandler();
  app.post(`/api/telegram-webhook/${token}`, webhookHandler);
  app.post(`/telegram-webhook/${token}`, webhookHandler);

  console.log('[Telegram Bot] @VinciDynamicsBot webhook routes: /api/telegram-webhook and /telegram-webhook');
}
