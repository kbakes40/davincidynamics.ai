/**
 * Integrated Telegram Bot Handler (Webhook-based)
 * Customer-facing: @VinciDynamicsBot (TELEGRAM_BOT_TOKEN)
 */

import type { Express } from 'express';
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
 * Start the bot with webhook
 */
export function startTelegramBot(app: Express, publicUrl?: string) {
  const token = getTelegramBotToken();
  if (!token) {
    console.warn('[Telegram Bot] Skipping bot start - TELEGRAM_BOT_TOKEN not set');
    return;
  }

  console.log('[Telegram Bot] Starting @VinciDynamicsBot (webhook)...');

  void ensureTelegramWebhookRegistered(token);

  // Webhook endpoint
  app.post(`/api/telegram-webhook/${token}`, async (req, res) => {
    try {
      const update: TelegramUpdate = req.body;
      
      if (update.message) {
        // Process message asynchronously
        processMessage(update.message).catch(err => {
          console.error('[Telegram Bot] Async process error:', err);
        });
      }
      
      // Respond immediately to Telegram
      res.status(200).send('OK');
    } catch (error) {
      console.error('[Telegram Bot] Webhook error:', error);
      res.status(500).send('Error');
    }
  });
  
  console.log('[Telegram Bot] @VinciDynamicsBot webhook endpoint ready');
}
