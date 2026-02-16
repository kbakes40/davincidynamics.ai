/**
 * Bridge Mode Message Forwarder
 * Forwards website chat messages to Telegram and routes responses back
 */

import { getDb } from './db';
import { conversations, botUsers } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

  /**
 * Forward customer message to @Leo_Handoff_bot
 * Includes 20-second timeout fallback
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
  
  const token = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
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
    
    // Set 20-second timeout for fallback message
    setTimeout(async () => {
      await sendTimeoutFallback(payload.conversationId);
    }, 20000);
    
    return true;
  } catch (error) {
    console.error('[Bridge] Error forwarding to Telegram:', error);
    return false;
  }
}

/**
 * Send timeout fallback message if no Leo reply within 20 seconds
 */
async function sendTimeoutFallback(conversationId: number): Promise<void> {
  console.log('[Bridge] Checking if timeout fallback needed for conversation:', conversationId);
  
  const db = await getDb();
  if (!db) return;
  
  // Check if Leo has replied in the last 20 seconds
  const { messages: messagesTable } = await import('../drizzle/schema');
  const { desc } = await import('drizzle-orm');
  
  const recentMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(desc(messagesTable.timestamp))
    .limit(5);
  
  // Check if the most recent message is from assistant (Leo replied)
  const lastMessage = recentMessages[0];
  if (lastMessage && lastMessage.role === 'assistant') {
    const messageAge = Date.now() - new Date(lastMessage.timestamp).getTime();
    if (messageAge < 20000) {
      console.log('[Bridge] Leo replied within 20s - no fallback needed');
      return;
    }
  }
  
  // Send fallback message
  console.log('[Bridge] ⏰ Sending 20s timeout fallback message');
  
  try {
    await db.insert(messagesTable).values({
      conversationId,
      role: 'assistant',
      content: 'Thanks for waiting — we\'re reviewing your request now.',
      timestamp: new Date(),
      intent: 'timeout_fallback'
    });
    
    console.log('[Bridge] ✅ Timeout fallback message sent');
  } catch (error) {
    console.error('[Bridge] Error sending timeout fallback:', error);
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
