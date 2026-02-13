import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
          businessName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          cityState: z.string().min(1),
          preferredPackage: z.string().min(1),
          meetingType: z.string().min(1),
          notes: z.string().optional(),
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

        const message = `🆕 New Demo Request\n\n` +
          `👤 Name: ${input.name}\n` +
          `🏢 Business: ${input.businessName}\n` +
          `📧 Email: ${input.email}\n` +
          `📱 Phone: ${input.phone}\n` +
          `📍 Location: ${input.cityState}\n` +
          `📦 Package: ${input.preferredPackage}\n` +
          `💬 Meeting: ${input.meetingType}\n` +
          (input.notes ? `📝 Notes: ${input.notes}` : "");

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
