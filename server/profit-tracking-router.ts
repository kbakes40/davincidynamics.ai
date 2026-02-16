import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { profitTracking } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const profitTrackingRouter = router({
  saveMonthlyData: protectedProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
        industry: z.enum(["e-commerce", "saas", "service"]),
        revenue: z.number().positive(),
        cogs: z.number().nonnegative(),
        platformCost: z.number().nonnegative(),
        adSpend: z.number().nonnegative(),
        fulfillmentCost: z.number().nonnegative(),
        otherCosts: z.number().nonnegative().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Calculate net profit and margin
      const totalCosts =
        input.cogs +
        input.platformCost +
        input.adSpend +
        input.fulfillmentCost +
        (input.otherCosts || 0);
      const netProfit = input.revenue - totalCosts;
      const profitMargin = (netProfit / input.revenue) * 100;

      // Check if entry exists for this month
      const existing = await db
        .select()
        .from(profitTracking)
        .where(
          and(
            eq(profitTracking.userId, ctx.user.id),
            eq(profitTracking.month, input.month)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing entry
        await db
          .update(profitTracking)
          .set({
            industry: input.industry,
            revenue: input.revenue.toString(),
            cogs: input.cogs.toString(),
            platformCost: input.platformCost.toString(),
            adSpend: input.adSpend.toString(),
            fulfillmentCost: input.fulfillmentCost.toString(),
            otherCosts: (input.otherCosts || 0).toString(),
            netProfit: netProfit.toString(),
            profitMargin: profitMargin.toFixed(2),
          })
          .where(eq(profitTracking.id, existing[0].id));

        return { success: true, id: existing[0].id, updated: true };
      } else {
        // Insert new entry
        const [result] = await db.insert(profitTracking).values({
          userId: ctx.user.id,
          month: input.month,
          industry: input.industry,
          revenue: input.revenue.toString(),
          cogs: input.cogs.toString(),
          platformCost: input.platformCost.toString(),
          adSpend: input.adSpend.toString(),
          fulfillmentCost: input.fulfillmentCost.toString(),
          otherCosts: (input.otherCosts || 0).toString(),
          netProfit: netProfit.toString(),
          profitMargin: profitMargin.toFixed(2),
        });

        return { success: true, id: result.insertId, updated: false };
      }
    }),

  getTrackingHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const history = await db
        .select()
        .from(profitTracking)
        .where(eq(profitTracking.userId, ctx.user.id))
        .orderBy(desc(profitTracking.month))
        .limit(input.limit);

      return history.map((entry) => ({
        ...entry,
        revenue: parseFloat(entry.revenue),
        cogs: parseFloat(entry.cogs),
        platformCost: parseFloat(entry.platformCost),
        adSpend: parseFloat(entry.adSpend),
        fulfillmentCost: parseFloat(entry.fulfillmentCost),
        otherCosts: parseFloat(entry.otherCosts),
        netProfit: parseFloat(entry.netProfit),
        profitMargin: parseFloat(entry.profitMargin),
      }));
    }),

  getProgressStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const history = await db
      .select()
      .from(profitTracking)
      .where(eq(profitTracking.userId, ctx.user.id))
      .orderBy(desc(profitTracking.month))
      .limit(12);

    if (history.length === 0) {
      return {
        totalMonths: 0,
        avgProfit: 0,
        avgMargin: 0,
        profitGrowth: 0,
        marginImprovement: 0,
      };
    }

    const totalProfit = history.reduce(
      (sum, entry) => sum + parseFloat(entry.netProfit),
      0
    );
    const totalMargin = history.reduce(
      (sum, entry) => sum + parseFloat(entry.profitMargin),
      0
    );

    // Calculate growth (compare latest to oldest)
    const latest = history[0];
    const oldest = history[history.length - 1];
    const profitGrowth =
      ((parseFloat(latest.netProfit) - parseFloat(oldest.netProfit)) /
        Math.abs(parseFloat(oldest.netProfit))) *
      100;
    const marginImprovement =
      parseFloat(latest.profitMargin) - parseFloat(oldest.profitMargin);

    return {
      totalMonths: history.length,
      avgProfit: totalProfit / history.length,
      avgMargin: totalMargin / history.length,
      profitGrowth: isFinite(profitGrowth) ? profitGrowth : 0,
      marginImprovement: isFinite(marginImprovement) ? marginImprovement : 0,
    };
  }),
});
