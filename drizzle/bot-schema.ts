/**
 * Database schema for Telegram Bot AI features
 * Sprint 1: Conversation memory and analytics
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Store Telegram user profiles and lead information
export const botUsers = sqliteTable('bot_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  telegramUserId: integer('telegram_user_id').notNull().unique(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastActive: integer('last_active', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  
  // Lead qualification data
  businessType: text('business_type'),
  monthlyRevenue: text('monthly_revenue'),
  currentPlatform: text('current_platform'),
  painPoints: text('pain_points'), // JSON array as string
  leadScore: integer('lead_score').default(0),
  status: text('status').default('new'), // new, qualified, booked, customer, lost
  
  // Preferences
  language: text('language').default('en'),
  timezone: text('timezone'),
  optedOut: integer('opted_out', { mode: 'boolean' }).default(false),
});

// Store conversation sessions
export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => botUsers.id),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  messageCount: integer('message_count').default(0),
  leadScoreChange: integer('lead_score_change').default(0),
  outcome: text('outcome'), // booked, qualified, dropped, etc.
});

// Store individual messages
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id),
  role: text('role').notNull(), // user, assistant, system
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  
  // Metadata
  tokensUsed: integer('tokens_used'),
  responseTimeMs: integer('response_time_ms'),
  intent: text('intent'), // pricing, demo, booking, etc.
  sentiment: text('sentiment'), // positive, neutral, negative
});

// Store lead qualification events
export const leadEvents = sqliteTable('lead_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => botUsers.id),
  eventType: text('event_type').notNull(), // qualified, score_change, booked, etc.
  eventData: text('event_data'), // JSON as string
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
