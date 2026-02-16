import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Telegram Bot tables for AI conversation tracking
export const botUsers = mysqlTable("bot_users", {
  id: int("id").autoincrement().primaryKey(),
  telegramUserId: varchar("telegram_user_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  
  // Lead qualification data
  businessType: varchar("business_type", { length: 100 }),
  monthlyRevenue: varchar("monthly_revenue", { length: 50 }),
  currentPlatform: varchar("current_platform", { length: 100 }),
  painPoints: text("pain_points"), // JSON array
  leadScore: int("lead_score").default(0),
  status: varchar("status", { length: 50 }).default("new"),
  
  // Preferences
  language: varchar("language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 50 }),
  optedOut: int("opted_out").default(0), // 0=false, 1=true
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  messageCount: int("message_count").default(0),
  leadScoreChange: int("lead_score_change").default(0),
  outcome: varchar("outcome", { length: 50 }),
  metadata: text("metadata"), // JSON for additional data like handoff status
  mode: mysqlEnum("mode", ["ai", "bridge"]).default("ai").notNull(), // ai = Leo AI responds automatically, bridge = forward to Telegram (DEFAULT: ai for LEO-FIRST mode)
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Metadata
  tokensUsed: int("tokens_used"),
  responseTimeMs: int("response_time_ms"),
  intent: varchar("intent", { length: 100 }),
  sentiment: varchar("sentiment", { length: 20 }),
});

export const leadEvents = mysqlTable("lead_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: text("event_data"), // JSON
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Export types
export type BotUser = typeof botUsers.$inferSelect;
export type NewBotUser = typeof botUsers.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type NewLeadEvent = typeof leadEvents.$inferInsert;