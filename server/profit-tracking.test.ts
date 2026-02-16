import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { getDb } from "./db";
import { profitTracking, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Profit Tracking Router", () => {
  let testUserId: number;
  let testContext: Context;

  beforeAll(async () => {
    // Create a test user
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-profit-${Date.now()}`,
        name: "Test Profit User",
        email: `profit-test-${Date.now()}@test.com`,
      })
      .$returningId();

    testUserId = user.id;

    testContext = {
      user: {
        id: testUserId,
        openId: `test-profit-${Date.now()}`,
        name: "Test Profit User",
        email: `profit-test-${Date.now()}@test.com`,
        role: "user",
        createdAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
  });

  it("should save monthly profit data", async () => {
    const caller = appRouter.createCaller(testContext);

    const result = await caller.profitTracking.saveMonthlyData({
      month: "2026-02",
      industry: "e-commerce",
      revenue: 10000,
      cogs: 3000,
      platformCost: 500,
      adSpend: 2000,
      fulfillmentCost: 1000,
      otherCosts: 500,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.updated).toBe(false); // New entry
  });

  it("should retrieve tracking history", async () => {
    const caller = appRouter.createCaller(testContext);

    // Save another entry
    await caller.profitTracking.saveMonthlyData({
      month: "2026-01",
      industry: "saas",
      revenue: 15000,
      cogs: 2000,
      platformCost: 800,
      adSpend: 3000,
      fulfillmentCost: 1200,
      otherCosts: 0,
    });

    const history = await caller.profitTracking.getTrackingHistory({
      limit: 10,
    });

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].userId).toBe(testUserId);
    expect(history[0].revenue).toBeGreaterThan(0);
    expect(history[0].netProfit).toBeDefined();
  });

  it("should calculate progress stats correctly", async () => {
    const caller = appRouter.createCaller(testContext);

    const stats = await caller.profitTracking.getProgressStats();

    expect(stats.totalMonths).toBeGreaterThan(0);
    expect(stats.avgProfit).toBeGreaterThan(0);
    expect(stats.avgMargin).toBeGreaterThan(0);
    expect(stats.profitGrowth).toBeDefined();
    expect(stats.marginImprovement).toBeDefined();
  });

  it("should update existing entry for same month", async () => {
    const caller = appRouter.createCaller(testContext);

    // Save initial entry
    await caller.profitTracking.saveMonthlyData({
      month: "2026-03",
      industry: "service",
      revenue: 8000,
      cogs: 2000,
      platformCost: 300,
      adSpend: 1000,
      fulfillmentCost: 800,
      otherCosts: 0,
    });

    // Update same month
    const result = await caller.profitTracking.saveMonthlyData({
      month: "2026-03",
      industry: "service",
      revenue: 9000,
      cogs: 2200,
      platformCost: 350,
      adSpend: 1200,
      fulfillmentCost: 900,
      otherCosts: 100,
    });

    expect(result.success).toBe(true);
    expect(result.updated).toBe(true); // Updated entry

    // Verify only one entry exists for this month
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const entries = await db
      .select()
      .from(profitTracking)
      .where(eq(profitTracking.userId, testUserId));

    const marchEntries = entries.filter((e) => e.month === "2026-03");
    expect(marchEntries.length).toBe(1);
  });

  it("should handle minimal revenue correctly", async () => {
    const caller = appRouter.createCaller(testContext);

    const result = await caller.profitTracking.saveMonthlyData({
      month: "2026-04",
      industry: "e-commerce",
      revenue: 100,
      cogs: 0,
      platformCost: 50,
      adSpend: 0,
      fulfillmentCost: 0,
      otherCosts: 0,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});
