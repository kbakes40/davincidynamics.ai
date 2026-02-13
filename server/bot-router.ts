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
      const msg = input.message.toLowerCase();
      
      // Navigation helpers
      if (msg.includes('book') || msg.includes('demo') || msg.includes('schedule')) {
        return "I can help you get to the booking page! [Click here to book a demo](/booking)\n\nFor detailed questions about pricing and packages, please chat with our AI assistant: [Open @DaVinciAssistBot](https://t.me/DaVinciAssistBot?start=site_chat)";
      }
      
      if (msg.includes('demo') || msg.includes('video') || msg.includes('watch')) {
        return "Check out our platform demos! [View Platform Demo](/platform-demo)\n\nFor specific questions about features, chat with: [Open @DaVinciAssistBot](https://t.me/DaVinciAssistBot?start=site_chat)";
      }
      
      if (msg.includes('calculat') || msg.includes('saving') || msg.includes('cost')) {
        return "Use our savings calculator on the [home page](/) to see how much you'll save!\n\nFor custom pricing quotes, please chat with: [Open @DaVinciAssistBot](https://t.me/DaVinciAssistBot?start=site_chat)";
      }
      
      if (msg.includes('contact') || msg.includes('email') || msg.includes('phone')) {
        return "Visit our [contact page](/contact) for all contact information.\n\nFor immediate assistance, chat with: [Open @DaVinciAssistBot](https://t.me/DaVinciAssistBot?start=site_chat)";
      }
      
      // Default: redirect to Telegram bot for all other questions
      return "For detailed questions about pricing, features, and custom solutions, please chat with our AI assistant on Telegram:\n\n[Open @DaVinciAssistBot](https://t.me/DaVinciAssistBot?start=site_chat)\n\n**I can help you navigate to:**\n📍 [Booking page](/booking)\n📍 [Platform demo](/platform-demo)\n📍 [Savings calculator](/)\n📍 [Contact info](/contact)";
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
});
