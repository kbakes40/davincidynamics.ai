/**
 * tRPC Router for Telegram Bot AI
 * Sprint 1: Expose AI handler via API
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { botAI } from './bot-ai-handler';
import { processTelegramWebhook } from './telegram-webhook';
import { pollMessages } from './poll-messages';
import { isBridgeMode } from './bridge-forwarder';
import { forwardToLeo } from './leo-telegram-bot';
import { getDb } from './db';
import { conversations, messages as messagesTable } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const botRouter = router({
  /**
   * Handle chat message from Telegram bot
   */
  chat: publicProcedure
    .input(z.object({
      telegramUser: z.object({
        id: z.number(),
        username: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      }),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      // First, get or create user and conversation to get conversation ID
      const user = await botAI.getOrCreateUser(input.telegramUser);
      const conversation = await botAI.getOrCreateConversation(user.id);
      const conversationId = conversation.id;
      
      // Check if conversation is in bridge mode BEFORE calling AI
      const bridgeMode = await isBridgeMode(conversationId);
      
      if (bridgeMode) {
        console.log('[Chat] Conversation', conversationId, 'is in bridge mode - forwarding to Telegram');
        
        // Get conversation metadata for customer info
        const db = await getDb();
        if (db) {
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);
          
          const metadata = conv[0]?.metadata ? JSON.parse(conv[0].metadata as string) : {};
          
          // Forward to Leo Telegram Bot
          await forwardToLeo({
            conversationId,
            customerName: metadata.name,
            customerEmail: metadata.email,
            customerPhone: metadata.phone,
            pageUrl: metadata.pageUrl,
            lastCustomerMessage: input.message
          });
          
          // Save user message
          await db.insert(messagesTable).values({
            conversationId,
            role: 'user',
            content: input.message,
            timestamp: new Date()
          });
        }
        
        // Return empty response - agent will respond via Telegram
        return {
          message: "",
          conversationId,
          isHandedOff: false
        };
      }
      
      // AI mode - call Leo AI handler
      const response = await botAI.handleMessage(input.telegramUser, input.message);
      return response;
    }),

  /**
   * Telegram webhook endpoint for receiving agent messages
   */
  telegramWebhook: publicProcedure
    .input(z.any()) // Telegram update object
    .mutation(async ({ input }) => {
      return await processTelegramWebhook(input);
    }),

  /**
   * Get user analytics
   */
  analytics: publicProcedure
    .input(z.object({
      telegramUserId: z.number(),
    }))
    .query(async ({ input }) => {
      // First get the bot user
      const user = await botAI.getOrCreateUser({
        id: input.telegramUserId,
      });
      
      // Then get analytics
      const analytics = await botAI.getUserAnalytics(user.id);
      return analytics;
    }),

  /**
   * End conversation
   */
  endConversation: publicProcedure
    .input(z.object({
      telegramUserId: z.number(),
      outcome: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await botAI.getOrCreateUser({
        id: input.telegramUserId,
      });
      
      await botAI.endConversation(user.id, input.outcome);
      return { success: true };
    }),

  /**
   * Log lead event
   */
  logEvent: publicProcedure
    .input(z.object({
      telegramUserId: z.number(),
      eventType: z.string(),
      eventData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await botAI.getOrCreateUser({
        id: input.telegramUserId,
      });
      
      await botAI.logLeadEvent(user.id, input.eventType, input.eventData);
      return { success: true };
    }),

  /**
   * Get full conversation history for a specific conversation
   */
  getConversation: publicProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input }) => {
      return await botAI.getFullConversation(input.conversationId);
    }),

  /**
   * List all conversations with filters
   */
  listConversations: publicProcedure
    .input(z.object({
      status: z.enum(['all', 'active', 'handed_off', 'ended']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      searchQuery: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await botAI.listConversations(input);
    }),

  /**
   * Poll for new messages in a conversation
   */
  pollMessages: publicProcedure
    .input(z.object({
      conversationId: z.number(),
      lastMessageId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await pollMessages(input);
    }),

  /**
   * Export conversation to JSON
   */
  exportConversation: publicProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input }) => {
      return await botAI.exportConversation(input.conversationId);
    }),
});
