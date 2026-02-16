/**
 * @DavinciDynamics_Chatbot - Telegram Bot Handler
 * Leo AI sales assistant that triggers on link clicks
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
 * Process incoming webhook update
 */
async function processUpdate(update: TelegramUpdate): Promise<void> {
  console.log('[DaVinci Bot] 📨 Received update:', JSON.stringify(update, null, 2));

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

  // Handle regular message with URL entities (link click)
  if (update.message) {
    const message = update.message;
    const userId = message.from.id;
    const chatId = message.chat.id;
    const text = message.text || '';

    // Check if message contains URL entities
    const urlEntities = message.entities?.filter(e => e.type === 'url' || e.type === 'text_link');
    
    if (urlEntities && urlEntities.length > 0) {
      console.log('[DaVinci Bot] 🔗 Link detected in message');

      const url = urlEntities[0].url || text.substring(
        urlEntities[0].offset,
        urlEntities[0].offset + urlEntities[0].length
      );

      const context = {
        user_name: message.from.first_name,
        user_id: userId.toString(),
        chat_id: chatId.toString(),
        link_url: url,
        last_user_message: text,
        timestamp: new Date(message.date * 1000).toISOString()
      };

      // Get Leo's response
      const { response } = await handleLinkClick(userId, context);

      // Send response
      await sendTelegramMessage(chatId, response);
      return;
    }

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        "👋 Hi! I'm Leo from DaVinci Dynamics. Click any link or button to get started, and I'll help you find the right solution for your business."
      );
      return;
    }

    // For any other message, treat as generic inquiry
    console.log('[DaVinci Bot] 💬 Regular message:', text);
    
    const context = {
      user_name: message.from.first_name,
      user_id: userId.toString(),
      chat_id: chatId.toString(),
      last_user_message: text,
      timestamp: new Date(message.date * 1000).toISOString()
    };

    const { response } = await handleLinkClick(userId, context);
    await sendTelegramMessage(chatId, response);
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

  // Webhook endpoint
  app.post(`/api/davinci-chatbot-webhook`, async (req, res) => {
    try {
      const update: TelegramUpdate = req.body;
      await processUpdate(update);
      res.json({ ok: true });
    } catch (error) {
      console.error('[DaVinci Bot] Error processing update:', error);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  });

  console.log('[DaVinci Bot] ✅ Webhook endpoint ready at /api/davinci-chatbot-webhook');
  console.log('[DaVinci Bot] 📝 Configure webhook URL after deployment');
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
