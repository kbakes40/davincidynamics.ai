/**
 * Polling endpoint to fetch new messages for real-time sync
 * Used by website chat to check for new agent messages from Telegram
 */

import { getDb } from './db';
import { messages, conversations } from '../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface PollMessagesInput {
  conversationId: number;
  lastMessageId?: number; // Only fetch messages after this ID
}

export interface PollMessagesResult {
  messages: Array<{
    id: number;
    role: string;
    content: string;
    timestamp: Date;
    intent: string | null;
  }>;
  isHandedOff: boolean;
  conversationEnded: boolean;
}

/**
 * Fetch new messages for a conversation since lastMessageId
 */
export async function pollMessages(input: PollMessagesInput): Promise<PollMessagesResult> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get conversation metadata
  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, input.conversationId))
    .limit(1);

  if (conv.length === 0) {
    throw new Error('Conversation not found');
  }

  const metadata = conv[0].metadata ? JSON.parse(conv[0].metadata as string) : {};
  const isHandedOff = metadata.handedOff === true;
  const conversationEnded = conv[0].endedAt !== null;

  // Fetch new messages
  let whereCondition = eq(messages.conversationId, input.conversationId);
  
  // If lastMessageId provided, only fetch messages after it
  if (input.lastMessageId) {
    whereCondition = and(
      eq(messages.conversationId, input.conversationId),
      gt(messages.id, input.lastMessageId)
    ) as any;
  }

  const newMessages = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      timestamp: messages.timestamp,
      intent: messages.intent,
    })
    .from(messages)
    .where(whereCondition)
    .orderBy(messages.timestamp);

  return {
    messages: newMessages,
    isHandedOff,
    conversationEnded,
  };
}
