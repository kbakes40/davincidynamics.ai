import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { leads } from "../drizzle/schema";

export const leadsRouter = router({
  capture: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        storeUrl: z.string().optional(),
        monthlySpend: z.number().optional(),
        sourcePage: z.string(),
        utmParams: z.object({
          source: z.string().optional(),
          medium: z.string().optional(),
          campaign: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      const [lead] = await db.insert(leads).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        storeUrl: input.storeUrl,
        monthlySpend: input.monthlySpend?.toString(),
        sourcePage: input.sourcePage,
        utmSource: input.utmParams?.source,
        utmMedium: input.utmParams?.medium,
        utmCampaign: input.utmParams?.campaign,
      });

      return { success: true, leadId: lead.insertId };
    }),
});
