/**
 * Telegram Webhook Handler
 * Receives messages from @Leo_Handoff_bot and syncs to website chat
 */

import { getDb } from './db';
import { messages, conversations, botUsers } from '../drizzle/schema';
import type { NewMessage } from '../drizzle/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    reply_to_message?: {
      message_id: number;
      text?: string;
    };
  };
}

/**
 * Process incoming Telegram webhook update
 */
export async function processTelegramWebhook(update: TelegramUpdate) {
  const db = await getDb();
  if (!db) {
    console.error('[Telegram Webhook] Database not available');
    return { success: false, error: 'Database unavailable' };
  }

  const message = update.message;
  if (!message || !message.text) {
    return { success: true, message: 'No text message to process' };
  }

  // Ignore messages from bots (including our own bot)
  if (message.from.is_bot) {
    return { success: true, message: 'Ignoring bot message' };
  }

  try {
    // Extract conversation ID from reply_to_message or parse from text
    // Format: "New lead from [User Name] (Conversation ID: 123)"
    let conversationId: number | null = null;

    if (message.reply_to_message?.text) {
      const match = message.reply_to_message.text.match(/Conversation ID: (\d+)/);
      if (match) {
        conversationId = parseInt(match[1], 10);
      }
    }

    if (!conversationId) {
      console.log('[Telegram Webhook] No conversation ID found, ignoring message');
      return { success: true, message: 'No conversation context' };
    }

    // Verify conversation exists and is handed off
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conv.length === 0) {
      console.error(`[Telegram Webhook] Conversation ${conversationId} not found`);
      return { success: false, error: 'Conversation not found' };
    }

    const metadata = conv[0].metadata ? JSON.parse(conv[0].metadata as string) : {};
    if (!metadata.handedOff) {
      console.log(`[Telegram Webhook] Conversation ${conversationId} not handed off yet`);
      return { success: false, error: 'Conversation not handed off' };
    }

    // Store agent message in database
    const newMessage: NewMessage = {
      conversationId,
      role: 'assistant', // Agent messages appear as assistant
      content: message.text,
      timestamp: new Date(message.date * 1000),
      // Store agent metadata in intent field for now
      intent: `telegram_agent:${message.from.first_name}`,
    };

    await db.insert(messages).values(newMessage);

    // Update conversation message count
    await db
      .update(conversations)
      .set({
        messageCount: (conv[0].messageCount || 0) + 1,
      })
      .where(eq(conversations.id, conversationId));

    console.log(`[Telegram Webhook] Agent message saved to conversation ${conversationId}`);

    return {
      success: true,
      conversationId,
      messageId: message.message_id,
    };
  } catch (error) {
    console.error('[Telegram Webhook] Error processing update:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Set up Telegram webhook
 */
export async function setupTelegramWebhook(botToken: string, webhookUrl: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    });

    const result = await response.json();
    console.log('[Telegram Webhook] Setup result:', result);
    return result;
  } catch (error) {
    console.error('[Telegram Webhook] Setup error:', error);
    throw error;
  }
}
