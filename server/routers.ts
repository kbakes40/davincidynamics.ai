import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { botRouter } from "./bot-router";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  bot: botRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  booking: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          company: z.string().optional(),
          department: z.enum(["general", "sales", "projects", "support", "billing"]),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        // Send to Telegram
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          console.error("Telegram credentials not configured");
          return { success: false, error: "Notification service not configured" };
        }

        const departmentNames = {
          general: "General Inquiry",
          sales: "Sales Inquiry",
          projects: "Active Project",
          support: "Technical Support",
          billing: "Billing and invoices",
        };

        const departmentEmails = {
          general: "info@davincidynamics.ai",
          sales: "sales@davincidynamics.ai",
          projects: "projects@davincidynamics.ai",
          support: "support@davincidynamics.ai",
          billing: "billing@davincidynamics.ai",
        };

        const message = `📨 New Contact Form Message\n\n` +
          `🏷️ Department: ${departmentNames[input.department]}\n` +
          `📧 Routes to: ${departmentEmails[input.department]}\n\n` +
          `👤 Name: ${input.name}\n` +
          `📧 Email: ${input.email}\n` +
          (input.company ? `🏢 Company: ${input.company}\n` : "") +
          `\n💬 Message:\n${input.message}`;

        try {
          const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "HTML",
              }),
            }
          );

          if (!response.ok) {
            console.error("Telegram API error:", await response.text());
            return { success: false, error: "Failed to send notification" };
          }

          return { success: true };
        } catch (error) {
          console.error("Error sending Telegram message:", error);
          return { success: false, error: "Failed to send notification" };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
