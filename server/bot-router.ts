/**
 * tRPC Router for Telegram Bot AI
 * Sprint 1: Expose AI handler via API
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { botAI } from './bot-ai-handler';

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
      // Use AI handler for full conversational responses
      const response = await botAI.handleMessage(input.telegramUser, input.message);
      return response;
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
