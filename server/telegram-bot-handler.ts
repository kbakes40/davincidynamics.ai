/**
 * Integrated Telegram Bot Handler (Webhook-based)
 * Runs alongside the main server to handle @DaVinciAssistBot messages
 */

import type { Express } from 'express';
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

const processedMessages = new Set<number>();

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
  
  // Prevent duplicate processing
  if (processedMessages.has(message.message_id)) {
    console.log(`[Telegram Bot] Skipping duplicate message ${message.message_id}`);
    return;
  }
  processedMessages.add(message.message_id);
  
  // Clean up old message IDs (keep last 1000)
  if (processedMessages.size > 1000) {
    const toDelete = Array.from(processedMessages).slice(0, 100);
    toDelete.forEach(id => processedMessages.delete(id));
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
    
    await sendMessage(chatId, response.message);
  } catch (error) {
    console.error('[Telegram Bot] Process message error:', error);
    await sendMessage(chatId, "Sorry, I encountered an error. Please try again or contact support.");
  }
}

/**
 * Delete webhook (cleanup)
 */
async function deleteWebhook() {
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook`);
    console.log('[Telegram Bot] Webhook deleted');
  } catch (error) {
    console.error('[Telegram Bot] Delete webhook error:', error);
  }
}

/**
 * Start the bot with webhook
 */
export function startTelegramBot(app: Express, publicUrl?: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[Telegram Bot] Skipping bot start - TELEGRAM_BOT_TOKEN not set');
    return;
  }
  
  console.log('[Telegram Bot] Starting @DaVinciAssistBot with webhook...');
  
  // Delete any existing webhook first
  deleteWebhook();
  
  // Webhook endpoint
  app.post(`/api/telegram-webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
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
  
  console.log('[Telegram Bot] @DaVinciAssistBot webhook endpoint ready');
  console.log('[Telegram Bot] Webhook URL will be set after deployment');
}
