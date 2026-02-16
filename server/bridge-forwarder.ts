/**
 * Bridge Mode Message Forwarder
 * Forwards website chat messages to Telegram and routes responses back
 */

import { getDb } from './db';
import { conversations, botUsers } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Forward customer message to @DavinciDynamics_Chatbot
 */
export async function forwardToTelegram(payload: {
  conversationId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  monthlySpend?: string;
  pageUrl?: string;
  lastCustomerMessage: string;
}): Promise<boolean> {
  console.log('[Bridge] Forwarding message to Telegram for conversation:', payload.conversationId);
  
  const token = process.env.DAVINCI_CHATBOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.error('[Bridge] Missing Telegram credentials');
    return false;
  }

  // Format message for Telegram
  const message = `🎯 New Lead - Take Over Conversation

👤 ${payload.customerName || 'Unknown'}
📧 ${payload.customerEmail || 'Not provided'}
📱 ${payload.customerPhone || 'Not provided'}
💰 Monthly Spend: ${payload.monthlySpend || 'Not provided'}
🌐 Page: ${payload.pageUrl || 'Not provided'}
💬 Customer: ${payload.lastCustomerMessage}

Conversation ID: ${payload.conversationId}

This customer is waiting on the website. Reply here and your message will appear in their chat window!`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Bridge] Failed to forward to Telegram:', errorText);
      return false;
    }

    console.log('[Bridge] ✅ Message forwarded to Telegram successfully');
    return true;
  } catch (error) {
    console.error('[Bridge] Error forwarding to Telegram:', error);
    return false;
  }
}

/**
 * Check if conversation is in bridge mode
 */
export async function isBridgeMode(conversationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  return conv.length > 0 && conv[0].mode === 'bridge';
}
