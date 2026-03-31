import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  storeUrl: varchar("store_url", { length: 500 }),
  monthlySpend: varchar("monthly_spend", { length: 50 }),
  sourcePage: varchar("source_page", { length: 255 }).notNull(),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  mode: mysqlEnum("mode", ["ai", "bridge"]).default("bridge").notNull(), // ai = Leo AI responds automatically, bridge = forward to @DavinciDynamics_Chatbot (DEFAULT: bridge for manual agent responses)
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

/** Vinci → internal agent (`leo`) handoff records; not customer-facing. */
export const vinciHandoffs = mysqlTable("vinci_handoffs", {
  id: int("id").autoincrement().primaryKey(),
  handoffId: varchar("handoff_id", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  conversationId: int("conversation_id"),
  botUserId: int("bot_user_id"),
  source: varchar("source", { length: 32 }).notNull(),
  telegramUserId: varchar("telegram_user_id", { length: 64 }).notNull(),
  telegramUsername: varchar("telegram_username", { length: 255 }),
  leadName: varchar("lead_name", { length: 255 }),
  businessType: varchar("business_type", { length: 64 }).notNull(),
  mainProblem: varchar("main_problem", { length: 64 }).notNull(),
  currentSetup: varchar("current_setup", { length: 64 }).notNull(),
  urgency: varchar("urgency", { length: 32 }).notNull(),
  leadScore: varchar("lead_score", { length: 16 }).notNull(),
  contactPreference: varchar("contact_preference", { length: 64 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  summary: text("summary"),
  lastUserMessage: text("last_user_message"),
  vinciNotes: text("vinci_notes"),
  handoffStatus: varchar("handoff_status", { length: 32 }).notNull().default("pending"),
  assignedTo: varchar("assigned_to", { length: 64 }).notNull().default("kevin_followup"),
  bookingLinkSent: int("booking_link_sent").notNull().default(0),
  contactCaptured: int("contact_captured").notNull().default(0),
  followupChannel: varchar("followup_channel", { length: 32 }),
  bluebubblesSentAt: timestamp("bluebubbles_sent_at"),
  bluebubblesStatus: varchar("bluebubbles_status", { length: 32 }).default("pending"),
  bluebubblesMessageId: varchar("bluebubbles_message_id", { length: 128 }),
  invalidPhone: int("invalid_phone").notNull().default(0),
});

export const profitTracking = mysqlTable("profit_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // Format: YYYY-MM
  industry: varchar("industry", { length: 50 }).notNull(), // e-commerce, saas, service
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 12, scale: 2 }).notNull(),
  platformCost: decimal("platform_cost", { precision: 12, scale: 2 }).notNull(),
  adSpend: decimal("ad_spend", { precision: 12, scale: 2 }).notNull(),
  fulfillmentCost: decimal("fulfillment_cost", { precision: 12, scale: 2 }).notNull(),
  otherCosts: decimal("other_costs", { precision: 12, scale: 2 }).default("0").notNull(),
  netProfit: decimal("net_profit", { precision: 12, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
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
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type VinciHandoff = typeof vinciHandoffs.$inferSelect;
export type NewVinciHandoff = typeof vinciHandoffs.$inferInsert;

export * from "./leadEngineSchema";