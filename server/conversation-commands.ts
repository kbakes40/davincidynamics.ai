import { getDb } from "./db";
import { conversations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Handle /takeback command - switch conversation to AI mode
 * Usage: /takeback 12345
 */
export async function handleTakebackCommand(conversationId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    return "❌ Database connection failed";
  }

  try {
    await db
      .update(conversations)
      .set({ mode: "ai" })
      .where(eq(conversations.id, conversationId));

    console.log(`[Command] /takeback executed - Conversation ${conversationId} switched to AI mode`);
    return `✅ Conversation ${conversationId} switched to AI mode. Leo AI will now respond automatically.`;
  } catch (error) {
    console.error(`[Command] /takeback failed:`, error);
    return `❌ Failed to switch conversation ${conversationId} to AI mode`;
  }
}

/**
 * Handle /handoffleo command - switch conversation to bridge mode
 * Usage: /handoffleo 12345
 */
export async function handleHandoffLeoCommand(conversationId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    return "❌ Database connection failed";
  }

  try {
    await db
      .update(conversations)
      .set({ mode: "bridge" })
      .where(eq(conversations.id, conversationId));

    console.log(`[Command] /handoffleo executed - Conversation ${conversationId} switched to bridge mode`);
    return `✅ Conversation ${conversationId} switched to bridge mode. You can now respond via Telegram.`;
  } catch (error) {
    console.error(`[Command] /handoffleo failed:`, error);
    return `❌ Failed to switch conversation ${conversationId} to bridge mode`;
  }
}

/**
 * Parse and execute conversation commands
 */
export async function parseConversationCommand(text: string): Promise<string | null> {
  const takebackMatch = text.match(/^\/takeback\s+(\d+)$/);
  if (takebackMatch) {
    const conversationId = parseInt(takebackMatch[1]);
    return await handleTakebackCommand(conversationId);
  }

  const handoffLeoMatch = text.match(/^\/handoffleo\s+(\d+)$/);
  if (handoffLeoMatch) {
    const conversationId = parseInt(handoffLeoMatch[1]);
    return await handleHandoffLeoCommand(conversationId);
  }

  return null; // Not a command
}
