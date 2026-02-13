/**
 * Integrated Telegram Bot Handler
 * Runs alongside the main server to handle @DaVinciAssistBot messages
 */

import { botAI } from './bot-ai-handler';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

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

let lastUpdateId = 0;

/**
 * Send message to Telegram user
 */
async function sendMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('[Telegram Bot] Send message error:', error);
    }
  } catch (error) {
    console.error('[Telegram Bot] Send message failed:', error);
  }
}

/**
 * Process incoming message
 */
async function processMessage(message: TelegramUpdate['message']) {
  if (!message || !message.text || message.from.is_bot) return;
  
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
    
    await sendMessage(chatId, response);
  } catch (error) {
    console.error('[Telegram Bot] Process message error:', error);
    await sendMessage(chatId, "Sorry, I encountered an error. Please try again or contact support.");
  }
}

/**
 * Poll for updates using long polling
 */
async function pollUpdates() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[Telegram Bot] TELEGRAM_BOT_TOKEN not configured');
    return;
  }
  
  try {
    const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    
    if (!response.ok) {
      console.error('[Telegram Bot] Get updates failed:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          await processMessage(update.message);
        }
      }
    }
  } catch (error) {
    console.error('[Telegram Bot] Poll updates error:', error);
  }
}

/**
 * Start the bot
 */
export function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[Telegram Bot] Skipping bot start - TELEGRAM_BOT_TOKEN not set');
    return;
  }
  
  console.log('[Telegram Bot] Starting @DaVinciAssistBot...');
  
  // Start polling loop
  const poll = async () => {
    await pollUpdates();
    setTimeout(poll, 100); // Poll immediately after each response
  };
  
  poll();
  
  console.log('[Telegram Bot] @DaVinciAssistBot is now running');
}
