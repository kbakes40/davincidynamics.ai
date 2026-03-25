/**
 * AI Handler for DaVinci Dynamics Telegram Bot
 * Sprint 1: AI-powered conversations with memory
 */

import {
  getDb,
  getDatabaseConnectivityCode,
  invalidateDbCache,
  isDatabaseConnectivityError,
} from './db';
import { botUsers, conversations, messages, leadEvents } from '../drizzle/schema';
import type { NewBotUser, NewConversation, NewMessage, NewLeadEvent } from '../drizzle/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { VinciStartSource } from './vinci-start';
import {
  processVinciTurn,
  vinciStateFromMeta,
  resolveStartSource,
} from './vinci-conversation-machine';
import type { VinciPersisted } from './vinci-conversation-machine';
import { createVinciHandoff, markConversationCompleted } from '../services/vinciHandoffService';

/** Historic conversation JSON key only (migrated into vinci on write). */
const LEGACY_VINCI_METADATA_KEY = 'revenueEngine';

export class BotAIHandler {
  private async readConversationMetadata(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    const db = await getDb();
    if (!db) return {};
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (conv.length === 0 || !conv[0].metadata) return {};
    try {
      return JSON.parse(conv[0].metadata as string) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private getVinciState(meta: Record<string, unknown>): Record<string, unknown> {
    const v = meta.vinci;
    if (typeof v === 'object' && v !== null) return v as Record<string, unknown>;
    const legacy = meta[LEGACY_VINCI_METADATA_KEY];
    if (typeof legacy === 'object' && legacy !== null) return legacy as Record<string, unknown>;
    return {};
  }

  private async mergeVinciMetadata(
    conversationId: number,
    patch: Record<string, unknown>
  ) {
    const db = await getDb();
    if (!db) return;
    const meta = await this.readConversationMetadata(conversationId);
    const prev = this.getVinciState(meta);
    const vinci = { ...prev, ...patch };
    const next: Record<string, unknown> = { ...meta, vinci };
    delete next[LEGACY_VINCI_METADATA_KEY];
    await db
      .update(conversations)
      .set({ metadata: JSON.stringify(next) })
      .where(eq(conversations.id, conversationId));
  }

  /**
   * Get or create bot user from Telegram user data
   */
  async getOrCreateUser(telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  }) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Check if user exists
    const existing = await db
      .select()
      .from(botUsers)
      .where(eq(botUsers.telegramUserId, String(telegramUser.id)))
      .limit(1);

    if (existing.length > 0) {
      // Update last active
      await db
        .update(botUsers)
        .set({ lastActive: new Date() })
        .where(eq(botUsers.id, existing[0].id));
      
      return existing[0];
    }

    // Create new user
    const newUser: NewBotUser = {
      telegramUserId: String(telegramUser.id),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    };

    await db.insert(botUsers).values(newUser);
    
    // Fetch the created user
    const created = await db
      .select()
      .from(botUsers)
      .where(eq(botUsers.telegramUserId, String(telegramUser.id)))
      .limit(1);

    return created[0];
  }

  /**
   * Get or create active conversation for user
   */
  async getOrCreateConversation(userId: number) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Check for active conversation (no endedAt)
    const active = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt))
      .limit(1);

    // If active conversation exists and hasn't ended, return it
    if (active.length > 0 && !active[0].endedAt) {
      return active[0];
    }

    // Create new conversation
    const newConv: NewConversation = {
      userId,
    };

    await db.insert(conversations).values(newConv);
    
    // Fetch the created conversation
    const created = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt))
      .limit(1);

    return created[0];
  }

  /**
   * Get recent conversation history for context
   */
  async getConversationHistory(conversationId: number, limit: number = 10) {
    const db = await getDb();
    if (!db) return [];

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);

    // Reverse to get chronological order
    return history.reverse().map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));
  }

  /**
   * Save message to database
   */
  async saveMessage(
    conversationId: number,
    role: string,
    content: string,
    metadata?: {
      tokensUsed?: number;
      responseTimeMs?: number;
      intent?: string;
      sentiment?: string;
    }
  ) {
    const db = await getDb();
    if (!db) return;

    const newMsg: NewMessage = {
      conversationId,
      role,
      content,
      ...metadata,
    };

    await db.insert(messages).values(newMsg);

    // Update conversation message count
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conv.length > 0) {
      await db
        .update(conversations)
        .set({ messageCount: (conv[0].messageCount || 0) + 1 })
        .where(eq(conversations.id, conversationId));
    }
  }

  /**
   * Extract contact information from message
   */
  private extractContactInfo(message: string): {
    name?: string;
    email?: string;
    phone?: string;
  } {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/;
    
    const email = message.match(emailRegex)?.[0];
    const phone = message.match(phoneRegex)?.[0];
    
    return { email, phone };
  }

  /**
   * Handle Telegram message — Vinci deterministic state machine + Leo handoff (internal only).
   */
  async handleMessage(
    telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    },
    userMessage: string,
    _context?: {
      page_name?: string;
      button_clicked?: string;
      button_label?: string;
      page_url?: string;
      customer_name?: string;
    }
  ): Promise<{
    message: string;
    conversationId: number;
    isHandedOff: boolean;
    vinciHandoffCompleted?: boolean;
  }> {
    try {
      const user = await this.getOrCreateUser(telegramUser);
      const conversation = await this.getOrCreateConversation(user.id);

      const db = await getDb();
      if (db) {
        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversation.id))
          .limit(1);

        if (conv.length > 0) {
          const metadata = conv[0].metadata ? JSON.parse(conv[0].metadata as string) : {};
          if (metadata.handedOff) {
            console.log("[Vinci] Conversation", conversation.id, "completed — user should start fresh");
            return {
              message:
                "That conversation is complete. Tap Start in the menu whenever you want a fresh chat.",
              conversationId: conversation.id,
              isHandedOff: true,
            };
          }
        }
      }

      const meta = await this.readConversationMetadata(conversation.id);
      const vs = vinciStateFromMeta(this.getVinciState(meta));
      const wasFreshIdle =
        vs.conversation_state === "idle" && vs.welcomeSentAtMs == null;

      const turn = processVinciTurn(userMessage, vs);

      if (resolveStartSource(userMessage) !== null && wasFreshIdle && turn.vinciPatch.welcomeSentAtMs) {
        await this.logLeadEvent(user.id, "vinci_start", {
          source: turn.vinciPatch.source ?? "unknown",
          state: turn.vinciPatch.conversation_state,
        });
      }

      if (turn.saveUserMessage) {
        await this.saveMessage(conversation.id, "user", userMessage);
      }

      await this.mergeVinciMetadata(
        conversation.id,
        turn.vinciPatch as Record<string, unknown>
      );

      if (turn.saveAssistantMessage) {
        await this.saveMessage(conversation.id, "assistant", turn.reply);
      }

      let vinciHandoffCompleted = false;
      if (turn.completeHandoff) {
        const mergedVs = { ...vs, ...turn.vinciPatch } as VinciPersisted;
        const history = await this.getConversationHistory(conversation.id, 100);
        const transcript = history
          .map((h) => `${String(h.role).toUpperCase()}: ${h.content}`)
          .join("\n\n");
        const leadName = [telegramUser.first_name, telegramUser.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();

        const { handoffId } = await createVinciHandoff({
          conversationId: conversation.id,
          botUserId: user.id,
          telegramUserId: String(telegramUser.id),
          telegramUsername: telegramUser.username,
          leadName: leadName || undefined,
          source: (mergedVs.source as VinciStartSource) || "unknown",
          lastUserMessage: turn.lastUserMessageForHandoff,
          transcript,
          businessType: mergedVs.business_type || "other",
          mainProblem: mergedVs.main_problem || "other",
          currentSetup: mergedVs.current_setup || "unknown",
          urgency: mergedVs.urgency || "unknown",
          leadScore: mergedVs.lead_score || "warm",
          contactPreference: mergedVs.contact_preference || "unknown",
          phone: mergedVs.phone,
          email: mergedVs.email,
          demoInterest: mergedVs.demo_interest,
        });

        await markConversationCompleted(conversation.id);

        if (db) {
          const leadEvent: NewLeadEvent = {
            userId: user.id,
            eventType: "vinci_handoff_completed",
            eventData: JSON.stringify({
              handoffId,
              conversationId: conversation.id,
              source: mergedVs.source,
              followupChannel: "bluebubbles",
            }),
          };
          await db.insert(leadEvents).values(leadEvent);
        }

        vinciHandoffCompleted = true;
      }

      return {
        message: turn.reply,
        conversationId: conversation.id,
        isHandedOff: vinciHandoffCompleted,
        vinciHandoffCompleted,
      };
    } catch (error) {
      if (isDatabaseConnectivityError(error)) {
        invalidateDbCache();
        const code = getDatabaseConnectivityCode(error);
        console.error(
          `[Database] Connectivity error${code ? ` (${code})` : ""} — cannot reach MySQL. Check DATABASE_URL host/port/TLS and provider firewall (allowlist).`
        );
        return {
          message:
            "We're having trouble reaching our systems right now. Please try again in a few minutes.",
          conversationId: -1,
          isHandedOff: false,
        };
      }
      console.error("Error handling message:", error);
      return {
        message:
          "Something went wrong on our end. Please try again in a moment.",
        conversationId: -1,
        isHandedOff: false,
      };
    }
  }

  /**
   * Log lead event
   */
  async logLeadEvent(
    userId: number,
    eventType: string,
    eventData?: Record<string, any>
  ) {
    const db = await getDb();
    if (!db) return;

    const event: NewLeadEvent = {
      userId,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : undefined,
    };

    await db.insert(leadEvents).values(event);
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: number) {
    const db = await getDb();
    if (!db) return null;

    const user = await db
      .select()
      .from(botUsers)
      .where(eq(botUsers.id, userId))
      .limit(1);

    if (user.length === 0) return null;

    const conversationList = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt));

    const events = await db
      .select()
      .from(leadEvents)
      .where(eq(leadEvents.userId, userId))
      .orderBy(desc(leadEvents.timestamp));

    return {
      user: user[0],
      totalConversations: conversationList.length,
      totalMessages: conversationList.reduce((sum, conv) => sum + (conv.messageCount || 0), 0),
      events: events,
    };
  }

  /**
   * End conversation
   */
  async endConversation(userId: number, outcome?: string) {
    const db = await getDb();
    if (!db) return;

    const active = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt))
      .limit(1);

    if (active.length > 0 && !active[0].endedAt) {
      await db
        .update(conversations)
        .set({ 
          endedAt: new Date(),
          outcome: outcome || 'ended_by_user'
        })
        .where(eq(conversations.id, active[0].id));
    }
  }

  /**
   * Get full conversation with all messages and metadata
   */
  async getFullConversation(conversationId: number) {
    const db = await getDb();
    if (!db) return null;

    // Get conversation details
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conv.length === 0) return null;

    // Get user details
    const user = await db
      .select()
      .from(botUsers)
      .where(eq(botUsers.id, conv[0].userId))
      .limit(1);

    // Get all messages
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);

    // Get lead events
    const events = await db
      .select()
      .from(leadEvents)
      .where(eq(leadEvents.userId, conv[0].userId))
      .orderBy(leadEvents.timestamp);

    // Parse metadata
    const metadata = conv[0].metadata ? JSON.parse(conv[0].metadata as string) : {};

    return {
      conversation: conv[0],
      user: user[0] || null,
      messages: msgs,
      events: events,
      metadata,
      duration: conv[0].endedAt 
        ? Math.floor((conv[0].endedAt.getTime() - conv[0].startedAt.getTime()) / 1000)
        : null,
    };
  }

  /**
   * List conversations with filters
   */
  async listConversations(filters: {
    status?: 'all' | 'active' | 'handed_off' | 'ended';
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }) {
    const db = await getDb();
    if (!db) return { conversations: [], total: 0 };

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    // Build query
    let query = db
      .select({
        conversation: conversations,
        user: botUsers,
      })
      .from(conversations)
      .leftJoin(botUsers, eq(conversations.userId, botUsers.id));

    // Apply filters
    const conditions = [];

    if (filters.status === 'active') {
      conditions.push(sql`${conversations.endedAt} IS NULL`);
    } else if (filters.status === 'handed_off') {
      conditions.push(sql`${conversations.metadata} LIKE '%"handedOff":true%'`);
    } else if (filters.status === 'ended') {
      conditions.push(sql`${conversations.endedAt} IS NOT NULL`);
    }

    if (filters.startDate) {
      conditions.push(sql`${conversations.startedAt} >= ${filters.startDate}`);
    }

    if (filters.endDate) {
      conditions.push(sql`${conversations.startedAt} <= ${filters.endDate}`);
    }

    if (filters.searchQuery) {
      conditions.push(
        sql`(
          ${botUsers.firstName} LIKE ${'%' + filters.searchQuery + '%'} OR
          ${botUsers.lastName} LIKE ${'%' + filters.searchQuery + '%'} OR
          ${botUsers.username} LIKE ${'%' + filters.searchQuery + '%'}
        )`
      );
    }

    // Execute query
    const results = await query
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(desc(conversations.startedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversations)
      .leftJoin(botUsers, eq(conversations.userId, botUsers.id))
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    return {
      conversations: results,
      total: countQuery[0]?.count || 0,
      limit,
      offset,
    };
  }

  /**
   * Export conversation to JSON
   */
  async exportConversation(conversationId: number) {
    const fullConv = await this.getFullConversation(conversationId);
    if (!fullConv) return null;

    return {
      exportedAt: new Date().toISOString(),
      conversation: fullConv,
    };
  }
}

// Export singleton instance
export const botAI = new BotAIHandler();
