/**
 * @DavinciDynamics_Chatbot - Telegram Bot Handler
 * Treats ALL incoming messages as agent output for active conversations
 */

import type { Express } from 'express';
import { handleLinkClick } from './leo-link-handler';

const DAVINCI_BOT_TOKEN = process.env.DAVINCI_CHATBOT_TOKEN;

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
    date: number;
    text?: string;
    entities?: Array<{
      type: string;
      offset: number;
      length: number;
      url?: string;
    }>;
    reply_to_message?: {
      text?: string;
    };
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data?: string;
  };
}

/**
 * Send message via Telegram Bot API
 */
async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  if (!DAVINCI_BOT_TOKEN) {
    console.error('[DaVinci Bot] Bot token not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${DAVINCI_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('[DaVinci Bot] Failed to send message:', await response.text());
      return false;
    }

    console.log('[DaVinci Bot] ✅ Message sent successfully');
    return true;
  } catch (error) {
    console.error('[DaVinci Bot] Error sending message:', error);
    return false;
  }
}

/**
 * Find newest unanswered conversation with owner=leo
 */
async function findActiveConversation(): Promise<number | null> {
  const { getDb } = await import('./db');
  const { conversations, messages: messagesTable } = await import('../drizzle/schema');
  const { desc, eq } = await import('drizzle-orm');
  
  const db = await getDb();
  if (!db) return null;

  // Get all conversations in bridge mode (owner=leo), ordered by most recent
  const activeConvs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.mode, 'bridge'))
    .orderBy(desc(conversations.startedAt))
    .limit(20);

  console.log('[DaVinci Bot] 🔍 Found', activeConvs.length, 'bridge mode conversations');

  // Find first conversation where last message is from user (not assistant)
  for (const conv of activeConvs) {
    const lastMessage = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conv.id))
      .orderBy(desc(messagesTable.timestamp))
      .limit(1);

    if (lastMessage.length > 0 && lastMessage[0].role === 'user') {
      console.log('[DaVinci Bot] ✅ Found unanswered conversation:', conv.id);
      return conv.id;
    }
  }

  // If no unanswered, return most recent bridge mode conversation
  if (activeConvs.length > 0) {
    console.log('[DaVinci Bot] ⚠️ No unanswered conversations, using most recent:', activeConvs[0].id);
    return activeConvs[0].id;
  }

  return null;
}

/**
 * Process incoming webhook update
 */
export async function processDaVinciUpdate(update: TelegramUpdate): Promise<void> {
  console.log('[DaVinci Bot] 📨 telegram_update_received:', JSON.stringify({
    update_id: update.update_id,
    message_id: update.message?.message_id,
    from: update.message?.from.username,
    text: update.message?.text?.substring(0, 100)
  }));

  // Handle callback query (button click)
  if (update.callback_query) {
    const query = update.callback_query;
    const userId = query.from.id;
    const chatId = query.message?.chat.id;
    const callbackData = query.data;

    console.log('[DaVinci Bot] 🔘 Button clicked:', callbackData);

    if (!chatId) {
      console.error('[DaVinci Bot] No chat ID in callback query');
      return;
    }

    // Parse callback data to extract link context
    const context = {
      user_name: query.from.first_name,
      user_id: userId.toString(),
      chat_id: chatId.toString(),
      link_label: callbackData,
      timestamp: new Date().toISOString()
    };

    // Get Leo's response
    const { response } = await handleLinkClick(userId, context);

    // Send response
    await sendTelegramMessage(chatId, response);

    // Answer callback query to remove loading state
    await fetch(`https://api.telegram.org/bot${DAVINCI_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: query.id
      })
    });

    return;
  }

  // Handle regular message
  if (update.message) {
    const message = update.message;
    const userId = message.from.id;
    const chatId = message.chat.id;
    const text = message.text || '';

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        "👋 Hi! I'm Leo from DaVinci Dynamics. Click any link or button to get started, and I'll help you find the right solution for your business."
      );
      return;
    }

    // Handle conversation commands (/takeback, /handoffleo)
    const { parseConversationCommand } = await import('./conversation-commands');
    const commandResponse = await parseConversationCommand(text);
    if (commandResponse) {
      await sendTelegramMessage(chatId, commandResponse);
      return;
    }

    // STEP 1: Try to extract explicit conversation ID from message
    const conversationIdMatch = text.match(/(?:Conversation ID:|\[?CID:?\]?|#)\s*(\d+)/);
    const replyToMessage = message.reply_to_message?.text;
    const replyConversationIdMatch = replyToMessage?.match(/(?:Conversation ID:|\[?CID:?\]?|#)\s*(\d+)/);
    
    let conversationId = conversationIdMatch?.[1] || replyConversationIdMatch?.[1];
    
    console.log('[DaVinci Bot] 🔍 cid_resolved (explicit):', conversationId || 'none');

    // STEP 2: If no explicit CID, find newest unanswered conversation with owner=leo
    if (!conversationId) {
      const autoConvId = await findActiveConversation();
      if (autoConvId) {
        conversationId = autoConvId.toString();
        console.log('[DaVinci Bot] 🔍 cid_resolved (auto-mapped):', conversationId);
      } else {
        console.log('[DaVinci Bot] ❌ No active owner=leo conversations found');
        await sendTelegramMessage(
          chatId,
          '❌ No active conversations found. Please include "Conversation ID: XXX" in your message.'
        );
        return;
      }
    }

    // STEP 3: Extract actual agent message (remove CID prefix if present)
    let agentMessage = text;
    if (conversationIdMatch) {
      // Remove "Conversation ID: 123" prefix from message
      agentMessage = text.replace(/(?:Conversation ID:|\[?CID:?\]?|#)\s*\d+\s*/, '').trim();
    }

    console.log('[DaVinci Bot] 💬 Agent message (cleaned):', agentMessage);

    // STEP 4: Send message to website chat
    const { getDb } = await import('./db');
    const { messages: messagesTable } = await import('../drizzle/schema');
    const db = await getDb();
    
    if (!db) {
      console.error('[DaVinci Bot] ❌ website_send_attempted: false (db_unavailable)');
      await sendTelegramMessage(chatId, '❌ Error: Database unavailable');
      return;
    }
    
    console.log('[DaVinci Bot] 📤 website_send_attempted: true');
    
    try {
      await db.insert(messagesTable).values({
        conversationId: parseInt(conversationId),
        role: 'assistant',
        content: agentMessage,
        timestamp: new Date(),
        intent: 'agent_message'
      });
      
      console.log('[DaVinci Bot] ✅ website_send_status: success');
      console.log('[DaVinci Bot] 📊 DELIVERY SUMMARY:', {
        telegram_update_received: update.update_id,
        cid_resolved: conversationId,
        website_send_attempted: true,
        website_send_status: 'success',
        message_length: agentMessage.length
      });
      
      // Confirm to agent
      await sendTelegramMessage(
        chatId,
        `✅ Message delivered to conversation ${conversationId}!\n\n"${agentMessage.substring(0, 100)}${agentMessage.length > 100 ? '...' : ''}"`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[DaVinci Bot] ❌ website_send_status: failed -', errorMsg);
      console.log('[DaVinci Bot] 📊 DELIVERY SUMMARY:', {
        telegram_update_received: update.update_id,
        cid_resolved: conversationId,
        website_send_attempted: true,
        website_send_status: 'failed',
        error: errorMsg
      });
      
      await sendTelegramMessage(
        chatId,
        `❌ Delivery failed!\n\nConversation: ${conversationId}\nError: ${errorMsg}`
      );
    }
  }
}

/**
 * Initialize DaVinci Dynamics Chatbot
 */
export function startDaVinciChatbot(app: Express): void {
  if (!DAVINCI_BOT_TOKEN) {
    console.error('[DaVinci Bot] DAVINCI_CHATBOT_TOKEN not configured - bot disabled');
    return;
  }

  console.log('[DaVinci Bot] Starting @DavinciDynamics_Chatbot...');

  // Note: Webhook endpoint is now registered in server/_core/index.ts

  console.log('[DaVinci Bot] ✅ Webhook endpoint ready at /api/davinci-chatbot-webhook');
  console.log('[DaVinci Bot] 📝 Configure webhook URL after deployment');
}

/**
 * Auto-setup webhook URL on server start
 */
export async function setupDaVinciWebhook(port: number): Promise<void> {
  if (!DAVINCI_BOT_TOKEN) {
    console.error('[DaVinci Bot] DAVINCI_CHATBOT_TOKEN not configured');
    return;
  }

  // In development, use the dev server URL
  // In production, this should be set via environment variable
  const baseUrl = process.env.WEBHOOK_BASE_URL || `https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer`;
  const webhookUrl = `${baseUrl}/api/davinci-chatbot-webhook`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${DAVINCI_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    if (response.ok) {
      console.log('[DaVinci Bot] ✅ Webhook configured:', webhookUrl);
    } else {
      const error = await response.text();
      console.error('[DaVinci Bot] ❌ Failed to set webhook:', error);
    }
  } catch (error) {
    console.error('[DaVinci Bot] Error setting webhook:', error);
  }
}

/**
 * Delete existing webhook (for development)
 */
export async function deleteDaVinciWebhook(): Promise<void> {
  if (!DAVINCI_BOT_TOKEN) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${DAVINCI_BOT_TOKEN}/deleteWebhook`);
    if (response.ok) {
      console.log('[DaVinci Bot] Webhook deleted');
    }
  } catch (error) {
    console.error('[DaVinci Bot] Error deleting webhook:', error);
  }
}
