/**
 * FULL AUTO LEO MODE - @DavinciDynamics_Chatbot
 * 
 * Automatically handles ALL website chat using Leo Chatbot Telegram
 * Uses WEBHOOK mode to avoid getUpdates conflicts
 */

import type { Express } from 'express';
import { getDb } from './db';
import { conversations, messages as messagesTable } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const BOT_TOKEN = process.env.DAVINCI_CHATBOT_TOKEN;
const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TIMEOUT_MS = 20000; // 20 seconds

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
    reply_to_message?: {
      text?: string;
    };
  };
}

interface PendingMessage {
  conversationId: number;
  timestamp: number;
  timeoutHandle: NodeJS.Timeout;
}

// Track pending messages awaiting Leo's reply
const pendingMessages = new Map<number, PendingMessage>();

// Track processed messages to prevent duplicates
const processedMessages = new Set<string>();

/**
 * Generate message hash for deduplication
 */
function getMessageHash(conversationId: number, content: string, direction: 'in' | 'out'): string {
  return crypto
    .createHash('sha256')
    .update(`${conversationId}:${content}:${direction}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Send message with retry logic (3 attempts, exponential backoff)
 */
async function sendWithRetry(
  chatId: string,
  text: string,
  maxRetries = 3
): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return true;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
      console.error(`[Leo Bot] Send attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`[Leo Bot] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[Leo Bot] All retry attempts failed');
  return false;
}

/**
 * Store message in database with retry logic
 */
async function storeMessageWithRetry(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  maxRetries = 3
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.error('[Leo Bot] Database unavailable');
    return false;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.insert(messagesTable).values({
        conversationId,
        role,
        content,
        timestamp: new Date(),
        intent: role === 'assistant' ? 'agent_message' : 'customer_message'
      });
      
      console.log(`[Leo Bot] ✅ delivered_to_website: conversation=${conversationId}`);
      return true;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[Leo Bot] ❌ delivery_failed: attempt=${attempt}, error=${error instanceof Error ? error.message : String(error)}`);
      
      if (attempt < maxRetries) {
        console.log(`[Leo Bot] Retrying database insert in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
}

/**
 * Send timeout fallback message
 */
async function sendTimeoutFallback(conversationId: number): Promise<void> {
  console.log(`[Leo Bot] ⏰ Timeout reached for conversation ${conversationId}`);
  
  const success = await storeMessageWithRetry(
    conversationId,
    'assistant',
    'Thanks for waiting — we\'re reviewing your request now.'
  );
  
  if (success) {
    console.log(`[Leo Bot] ✅ Timeout fallback sent to conversation ${conversationId}`);
  }
  
  pendingMessages.delete(conversationId);
}

/**
 * Forward customer message to Leo
 */
export async function forwardToLeo(payload: {
  conversationId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pageUrl?: string;
  lastCustomerMessage: string;
}): Promise<void> {
  if (!BOT_TOKEN || !OWNER_CHAT_ID) {
    console.error('[Leo Bot] Missing bot token or chat ID');
    return;
  }

  console.log(`[Leo Bot] 📨 inbound_received: conversation=${payload.conversationId}`);

  // Check for duplicate
  const messageHash = getMessageHash(payload.conversationId, payload.lastCustomerMessage, 'in');
  if (processedMessages.has(messageHash)) {
    console.log(`[Leo Bot] ⚠️ Duplicate message detected, skipping`);
    return;
  }
  processedMessages.add(messageHash);

  // Format message for Leo
  const message = `
🆕 <b>New Customer Message</b>

<b>Conversation ID:</b> ${payload.conversationId}
<b>Customer:</b> ${payload.customerName || 'Unknown'}
${payload.customerEmail ? `<b>Email:</b> ${payload.customerEmail}\n` : ''}${payload.customerPhone ? `<b>Phone:</b> ${payload.customerPhone}\n` : ''}<b>Page:</b> ${payload.pageUrl || 'Unknown'}

<b>Message:</b>
${payload.lastCustomerMessage}

<i>Reply to this message to respond to the customer.</i>
  `.trim();

  const success = await sendWithRetry(OWNER_CHAT_ID, message);
  
  if (success) {
    console.log(`[Leo Bot] ✅ forwarded_to_telegram: conversation=${payload.conversationId}`);
    
    // Set timeout for fallback
    const timeoutHandle = setTimeout(() => {
      sendTimeoutFallback(payload.conversationId);
    }, TIMEOUT_MS);
    
    pendingMessages.set(payload.conversationId, {
      conversationId: payload.conversationId,
      timestamp: Date.now(),
      timeoutHandle
    });
  } else {
    console.error(`[Leo Bot] ❌ Failed to forward message to Telegram`);
  }
}

/**
 * Process incoming webhook update from Telegram
 */
export async function processLeoWebhook(update: TelegramUpdate): Promise<void> {
  if (!update.message) return;

  const message = update.message;
  const text = message.text;
  if (!text) return;

  console.log(`[Leo Bot] 📨 leo_reply_received: "${text.substring(0, 50)}..."`);

  // Check for manual override commands
  if (text.startsWith('/takeback ')) {
    const conversationId = parseInt(text.split(' ')[1]);
    if (!isNaN(conversationId)) {
      const db = await getDb();
      if (db) {
        await db
          .update(conversations)
          .set({ mode: 'ai' })
          .where(eq(conversations.id, conversationId));
        
        await sendWithRetry(OWNER_CHAT_ID!, `✅ Conversation ${conversationId} switched to AI mode (Leo paused)`);
        console.log(`[Leo Bot] Conversation ${conversationId} switched to AI mode`);
      }
    }
    return;
  }

  if (text.startsWith('/handoffleo ')) {
    const conversationId = parseInt(text.split(' ')[1]);
    if (!isNaN(conversationId)) {
      const db = await getDb();
      if (db) {
        await db
          .update(conversations)
          .set({ mode: 'bridge' })
          .where(eq(conversations.id, conversationId));
        
        await sendWithRetry(OWNER_CHAT_ID!, `✅ Conversation ${conversationId} switched to bridge mode (Leo resumed)`);
        console.log(`[Leo Bot] Conversation ${conversationId} switched to bridge mode`);
      }
    }
    return;
  }

  // Extract conversation ID from message or reply
  let conversationId: number | null = null;
  
  // Try to extract from current message
  const cidMatch = text.match(/(?:Conversation ID:|\[?CID:?\]?|#)\s*(\d+)/i);
  if (cidMatch) {
    conversationId = parseInt(cidMatch[1]);
  }
  
  // Try to extract from replied message
  if (!conversationId && message.reply_to_message) {
    const replyText = message.reply_to_message.text;
    if (replyText) {
      const replyMatch = replyText.match(/(?:Conversation ID:|\[?CID:?\]?|#)\s*(\d+)/i);
      if (replyMatch) {
        conversationId = parseInt(replyMatch[1]);
      }
    }
  }

  // If still no conversation ID, find most recent pending conversation
  if (!conversationId) {
    const pending = Array.from(pendingMessages.values())
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (pending) {
      conversationId = pending.conversationId;
      console.log(`[Leo Bot] Auto-mapped to most recent conversation: ${conversationId}`);
    }
  }

  if (!conversationId) {
    await sendWithRetry(OWNER_CHAT_ID!, '❌ Could not determine conversation ID. Please include "Conversation ID: XXX" in your message or reply to a customer message.');
    return;
  }

  // Clean message (remove CID prefix if present)
  let cleanMessage = text;
  if (cidMatch) {
    cleanMessage = text.replace(/(?:Conversation ID:|\[?CID:?\]?|#)\s*\d+\s*/i, '').trim();
  }

  // Check for duplicate
  const messageHash = getMessageHash(conversationId, cleanMessage, 'out');
  if (processedMessages.has(messageHash)) {
    console.log(`[Leo Bot] ⚠️ Duplicate reply detected, skipping`);
    return;
  }
  processedMessages.add(messageHash);

  // Clear timeout if exists
  const pending = pendingMessages.get(conversationId);
  if (pending) {
    clearTimeout(pending.timeoutHandle);
    pendingMessages.delete(conversationId);
  }

  // Store Leo's reply in database
  const success = await storeMessageWithRetry(conversationId, 'assistant', cleanMessage);
  
  if (success) {
    await sendWithRetry(OWNER_CHAT_ID!, `✅ Message delivered to conversation ${conversationId}`);
  } else {
    await sendWithRetry(OWNER_CHAT_ID!, `❌ Failed to deliver message to conversation ${conversationId}`);
  }
}

/**
 * Setup webhook for Leo Telegram Bot
 */
export async function setupLeoWebhook(app: Express, port: number): Promise<void> {
  if (!BOT_TOKEN) {
    console.error('[Leo Bot] DAVINCI_CHATBOT_TOKEN not configured');
    return;
  }

  console.log('[Leo Bot] Setting up @DavinciDynamics_Chatbot in FULL AUTO MODE (webhook)...');

  // Register webhook endpoint
  app.post('/api/leo-webhook', async (req, res) => {
    try {
      console.log('[Leo Webhook] Received update');
      await processLeoWebhook(req.body);
      res.json({ ok: true });
    } catch (error) {
      console.error('[Leo Webhook] Error processing update:', error);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  });

  // Configure webhook URL with Telegram
  const baseUrl = process.env.WEBHOOK_BASE_URL || `https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer`;
  const webhookUrl = `${baseUrl}/api/leo-webhook`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    if (response.ok) {
      console.log('[Leo Bot] ✅ Webhook configured:', webhookUrl);
      console.log('[Leo Bot] ✅ FULL AUTO MODE active - webhook ready');
    } else {
      const error = await response.text();
      console.error('[Leo Bot] ❌ Failed to set webhook:', error);
    }
  } catch (error) {
    console.error('[Leo Bot] Error setting webhook:', error);
  }
}
