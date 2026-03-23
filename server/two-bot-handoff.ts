/**
 * Website chat → agent pipeline (legacy widget path).
 * Vinci Telegram customers use vinci-leo-handoff.ts (internal Leo notes only).
 */

import { Telegraf } from 'telegraf';
import { getDb } from './db';
import { conversations, messages as messagesTable } from '../drizzle/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';

const HANDOFF_BOT_TOKEN = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
const DAVINCI_BOT_TOKEN = process.env.DAVINCI_CHATBOT_TOKEN;
const DAVINCI_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8458081526'; // Your Telegram chat ID

if (!HANDOFF_BOT_TOKEN) {
  console.error('[Two-Bot Handoff] TELEGRAM_HANDOFF_BOT_TOKEN not configured');
}
if (!DAVINCI_BOT_TOKEN) {
  console.error('[Two-Bot Handoff] DAVINCI_CHATBOT_TOKEN not configured');
}

// Initialize bots
const handoffBot = HANDOFF_BOT_TOKEN ? new Telegraf(HANDOFF_BOT_TOKEN) : null;

// Track processed messages to avoid duplicates
const processedMessages = new Set<string>();

/**
 * Forward message from website to @Leo_Handoff_bot, which then forwards to @DavinciDynamics_Chatbot
 */
export async function forwardToHandoffBot(params: {
  conversationId: number;
  customerMessage: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pageUrl?: string;
}): Promise<void> {
  const { conversationId, customerMessage, customerName, customerEmail, customerPhone, pageUrl } = params;

  console.log('[Two-Bot Handoff] 📨 inbound_received:', { conversationId, message: customerMessage.substring(0, 50) });

  if (!HANDOFF_BOT_TOKEN || !DAVINCI_BOT_TOKEN || !DAVINCI_CHAT_ID) {
    console.error('[Two-Bot Handoff] Missing required tokens/chat ID');
    return;
  }

  try {
    // Format message for Telegram
    const messageText = `🆕 **New Lead - Conversation ${conversationId}**

${customerName ? `👤 Name: ${customerName}` : ''}
${customerEmail ? `📧 Email: ${customerEmail}` : ''}
${customerPhone ? `📞 Phone: ${customerPhone}` : ''}
${pageUrl ? `🔗 Page: ${pageUrl}` : ''}

💬 **Message:**
${customerMessage}

---
Reply to this message to respond to the customer.`;

    // Step 1: Send to @Leo_Handoff_bot (just for logging/tracking)
    // In reality, we skip this and go directly to DavinciBot since we control both
    
    // Step 2: Forward directly to @DavinciDynamics_Chatbot
    const response = await fetch(`https://api.telegram.org/bot${DAVINCI_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: DAVINCI_CHAT_ID,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Two-Bot Handoff] Failed to send to DavinciBot:', error);
      return;
    }

    console.log('[Two-Bot Handoff] ✅ forwarded_to_davinci:', { conversationId });

    // Set up timeout fallback (20 seconds)
    setTimeout(async () => {
      const db = await getDb();
      if (!db) return;

      // Check if agent has responded
      const recentMessages = await db
        .select()
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, conversationId),
            eq(messagesTable.role, 'assistant')
          )
        )
        .orderBy(desc(messagesTable.timestamp))
        .limit(1);

      // If no response in last 20 seconds, send fallback
      if (recentMessages.length === 0 || 
          (Date.now() - new Date(recentMessages[0].timestamp).getTime() > 19000)) {
        await db.insert(messagesTable).values({
          conversationId,
          role: 'assistant',
          content: 'Thanks for waiting — we\'re reviewing your request now.',
          timestamp: new Date(),
        });
        console.log('[Two-Bot Handoff] ⏰ Timeout fallback sent:', conversationId);
      }
    }, 20000);

  } catch (error) {
    console.error('[Two-Bot Handoff] Error forwarding message:', error);
  }
}

// Note: @DavinciDynamics_Chatbot responses are handled by OpenClaw
// This system only forwards website messages to DavinciBot
// OpenClaw controls the bot and posts responses back to the website
