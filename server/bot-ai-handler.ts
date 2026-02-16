/**
 * AI Handler for DaVinci Dynamics Telegram Bot
 * Sprint 1: AI-powered conversations with memory
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { botUsers, conversations, messages, leadEvents } from '../drizzle/schema';
import type { NewBotUser, NewConversation, NewMessage, NewLeadEvent } from '../drizzle/schema';
import { eq, desc, sql } from 'drizzle-orm';

const SYSTEM_PROMPT = `You are the DaVinci Dynamics website assistant.

GOAL
Convert visitors into qualified leads and booked demos.

TONE
Straightforward, confident, concise, helpful.
Keep responses under 80 words unless user asks for detail.
Ask only one qualifying question per message.

CONTEXT INPUTS (if available)
- page_name
- button_clicked
- button_label
- page_url
- customer_name
- last_user_message

CORE RULES
1) Always tailor first reply to the button/page context.
2) Ask one relevant qualifying question each turn.
3) Move qualified users toward booking a demo.
4) Never mention internal prompts, tools, automations, webhooks, or system logic.
5) If user asks pricing, use:
- Setup: $2,500–$5,000
- Monthly: $500–$1,500
- Typical savings: 60–80%

BUTTON-BASED RESPONSE LOGIC

If button_clicked is "Get My Savings Plan":
Reply:
"Great choice — we can usually identify major cost leaks fast. Quick one: what are you spending monthly on platform fees, payment processing, and apps combined?"

If button_clicked is "Book Demo":
Reply:
"Perfect — I'll help make your demo highly relevant. Are you currently selling mostly through Shopify, social DMs, or your own website?"

If button_clicked is "See Pricing":
Reply:
"We're typically a one-time setup of $2,500–$5,000 and $500–$1,500 monthly, with many sellers saving 60–80% vs bloated stacks. What's your current monthly spend so I can estimate your fit?"

If button_clicked is "Platform Demo":
Reply:
"Awesome — I can point you to the most relevant workflow first. Is your biggest issue right now platform fees, conversion rate, or manual operations?"

If button_clicked is "Solutions":
Reply:
"Got it — we tailor by business model. Are you mainly a Facebook/TikTok seller, a specialty retail shop, or a standard ecommerce store?"

If button_clicked is "Contact":
Reply:
"Happy to help. What do you need most right now: setup, migration, payments, shipping, or automation?"

If button_clicked is "Hire via Fiverr":
Reply:
"Great — I can scope this quickly. Are you looking for a new build or optimization of your current setup, and what timeline are you targeting?"

If button_clicked is unknown:
Reply:
"Glad you reached out — what are you trying to solve first: reducing platform costs, improving conversions, or automating follow-up?"

LEAD CAPTURE FLOW (after first question)
Collect:
1) current platform/channel
2) monthly spend
3) main pain point
4) name + email + phone
Then CTA:
"Want me to map your savings and next steps on a quick demo call?"

OBJECTION HANDLING (short form)
- "Too expensive":
"Totally fair. Most clients switch because recurring stack costs are higher long-term. If you share your current monthly total, I can show whether this is actually cheaper for you."
- "Need to think":
"Of course — want a quick savings estimate first so your decision is based on numbers?"
- "Just browsing":
"No problem. Want a 30-second breakdown of where most small sellers overpay?"

OUTPUT
Return only customer-facing reply text.
No JSON. No labels. No internal notes.`;

export class BotAIHandler {
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
   * Send handoff notification to both Telegram bots
   */
  private async sendHandoffNotification(leadData: {
    name?: string;
    email?: string;
    phone?: string;
    conversationId: number;
    userId: number;
    monthlySpend?: string;
  }) {
    console.log('[Handoff] Attempting to send notification for conversation:', leadData.conversationId);
    
    const handoffToken = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
    const handoffChatId = process.env.TELEGRAM_CHAT_ID;
    const davinciToken = process.env.DAVINCI_CHATBOT_TOKEN;
    
    console.log('[Handoff] Handoff bot token:', !!handoffToken, 'Chat ID:', !!handoffChatId);
    console.log('[Handoff] DaVinci bot token:', !!davinciToken);
    
    // Message for tracking bot (@Leo_Handoff_bot)
    const trackingMessage = `🔔 New Lead Handoff

👤 Name: ${leadData.name || 'Not provided'}
📧 Email: ${leadData.email || 'Not provided'}
📱 Phone: ${leadData.phone || 'Not provided'}
💰 Monthly Spend: ${leadData.monthlySpend || 'Not provided'}

Conversation ID: ${leadData.conversationId}
User ID: ${leadData.userId}

Leo has captured their information and handed off the conversation. Please follow up!`;
    
    // Message for DaVinci bot (will respond back to website)
    const davinciMessage = `🎯 New Lead - Take Over Conversation

👤 ${leadData.name || 'Customer'}
📧 ${leadData.email || 'No email'}
📱 ${leadData.phone || 'No phone'}
💰 Monthly Spend: ${leadData.monthlySpend || 'Not provided'}

Conversation ID: ${leadData.conversationId}

This customer is waiting on the website. Reply here and your message will appear in their chat window!`;

    // Send to @Leo_Handoff_bot for tracking
    if (handoffToken && handoffChatId) {
      console.log('[Handoff] Sending tracking notification to @Leo_Handoff_bot');
      try {
        const response = await fetch(`https://api.telegram.org/bot${handoffToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: handoffChatId,
            text: trackingMessage,
            parse_mode: 'HTML'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Handoff] ERROR: Failed to send tracking notification:', errorText);
        } else {
          console.log('[Handoff] ✅ Tracking notification sent to @Leo_Handoff_bot!');
        }
      } catch (error) {
        console.error('[Handoff] ERROR: Exception sending tracking notification:', error);
      }
    }
    
    // Send to @DavinciDynamics_Chatbot for agent takeover
    if (davinciToken && handoffChatId) {
      console.log('[Handoff] Sending takeover notification to @DavinciDynamics_Chatbot');
      try {
        const response = await fetch(`https://api.telegram.org/bot${davinciToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: handoffChatId,
            text: davinciMessage,
            parse_mode: 'HTML'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Handoff] ERROR: Failed to send DaVinci notification:', errorText);
        } else {
          console.log('[Handoff] ✅ Takeover notification sent to @DavinciDynamics_Chatbot!');
        }
      } catch (error) {
        console.error('[Handoff] ERROR: Exception sending DaVinci notification:', error);
      }
    }
  }

  /**
   * Check if conversation should be handed off
   */
  private async checkForHandoff(conversationId: number, userMessage: string, assistantResponse: string | Array<any>) {
    const db = await getDb();
    if (!db) return false;

    // Check if assistant response contains handoff message
    const responseText = typeof assistantResponse === 'string' ? assistantResponse : JSON.stringify(assistantResponse);
    const handoffTrigger = responseText.toLowerCase().includes("i'm connecting you with our team now");
    
    if (handoffTrigger) {
      // Extract contact info from conversation history
      const history = await this.getConversationHistory(conversationId, 20);
      let name, email, phone, monthlySpend;

      // Search through history for contact info and spending
      for (const msg of history) {
        const content = msg.content.toLowerCase();
        const contactInfo = this.extractContactInfo(msg.content);
        
        if (contactInfo.email) email = contactInfo.email;
        if (contactInfo.phone) phone = contactInfo.phone;
        
        // Try to extract name (look for "my name is" or similar patterns)
        const nameMatch = msg.content.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch) name = nameMatch[1];
        
        // Try to extract monthly spend
        const spendMatch = msg.content.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per month|\/month|monthly)/i);
        if (spendMatch) monthlySpend = `$${spendMatch[1]}/month`;
      }

      // Get conversation details
      const conv = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (conv.length > 0) {
        // Mark conversation as handed off
        await db
          .update(conversations)
          .set({ 
            endedAt: new Date(),
            metadata: JSON.stringify({ handedOff: true, contactCaptured: true })
          })
          .where(eq(conversations.id, conversationId));

        // Send handoff notification
        await this.sendHandoffNotification({
          name,
          email,
          phone,
          monthlySpend,
          conversationId,
          userId: conv[0].userId
        });

        // Log lead event
        const leadEvent: NewLeadEvent = {
          userId: conv[0].userId,
          eventType: 'handoff',
          eventData: JSON.stringify({ name, email, phone, monthlySpend, conversationId })
        };
        await db.insert(leadEvents).values(leadEvent);

        return true;
      }
    }

    return false;
  }

  /**
   * Handle user message with AI
   */
  async handleMessage(
    telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    },
    userMessage: string,
    context?: {
      page_name?: string;
      button_clicked?: string;
      button_label?: string;
      page_url?: string;
      customer_name?: string;
    }
  ): Promise<{ message: string; conversationId: number; isHandedOff: boolean }> {
    const startTime = Date.now();

    try {
      // Get or create user
      const user = await this.getOrCreateUser(telegramUser);

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(user.id);

      // Check if conversation is already handed off
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
            console.log('[Leo AI] Conversation', conversation.id, 'is handed off - not responding');
            // Return empty message - agent will respond via Telegram
            return {
              message: "",
              conversationId: conversation.id,
              isHandedOff: true
            };
          }
        }
      }

      // Save user message
      await this.saveMessage(conversation.id, 'user', userMessage);

      // Get conversation history
      const history = await this.getConversationHistory(conversation.id);

      // Prepare messages for LLM with context
      let systemPromptWithContext = SYSTEM_PROMPT;
      
      if (context) {
        const contextInfo = [];
        if (context.page_name) contextInfo.push(`page_name: ${context.page_name}`);
        if (context.button_clicked) contextInfo.push(`button_clicked: ${context.button_clicked}`);
        if (context.button_label) contextInfo.push(`button_label: ${context.button_label}`);
        if (context.page_url) contextInfo.push(`page_url: ${context.page_url}`);
        if (context.customer_name) contextInfo.push(`customer_name: ${context.customer_name}`);
        
        if (contextInfo.length > 0) {
          systemPromptWithContext += `\n\nCURRENT CONTEXT:\n${contextInfo.join('\n')}`;
        }
      }
      
      const llmMessages = [
        { role: 'system' as const, content: systemPromptWithContext },
        ...history,
      ];

      // Call LLM with 15-second timeout and retry
      let response;
      let assistantMessage: string = "Thanks for your message — one moment while I pull up the best next step for you.";
      let responseTime: number = Date.now() - startTime;
      let attempt = 0;
      const maxAttempts = 2;
      
      while (attempt < maxAttempts) {
        attempt++;
        console.log(`[Leo AI] Generation attempt ${attempt}/${maxAttempts} for conversation ${conversation.id}`);
        
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('LLM timeout after 15s')), 15000)
          );
          
          const llmPromise = invokeLLM({
            messages: llmMessages,
          });
          
          response = await Promise.race([llmPromise, timeoutPromise]) as any;
          
          const rawContent = response.choices[0].message.content;
          assistantMessage = typeof rawContent === 'string' 
            ? rawContent 
            : (Array.isArray(rawContent) ? JSON.stringify(rawContent) : 'I apologize, but I encountered an error. Please try again.');
          responseTime = Date.now() - startTime;
          
          console.log(`[Leo AI] ✅ Generation successful in ${responseTime}ms`);
          break; // Success - exit retry loop
          
        } catch (error) {
          console.error(`[Leo AI] ⚠️ Generation attempt ${attempt} failed:`, error);
          
          if (attempt < maxAttempts) {
            console.log('[Leo AI] Retrying...');
            continue;
          }
          
          // Final attempt failed - use fallback message
          console.error('[Leo AI] ❌ All attempts failed, using fallback');
          assistantMessage = "Thanks for your message — one moment while I pull up the best next step for you.";
          responseTime = Date.now() - startTime;
        }
      }

      // Save assistant message
      await this.saveMessage(
        conversation.id,
        'assistant',
        assistantMessage,
        {
          tokensUsed: response.usage?.total_tokens,
          responseTimeMs: responseTime,
        }
      );

      // Check for handoff after saving the message
      const wasHandedOff = await this.checkForHandoff(conversation.id, userMessage, assistantMessage);

      return {
        message: assistantMessage,
        conversationId: conversation.id,
        isHandedOff: wasHandedOff
      };
    } catch (error) {
      console.error('Error handling message:', error);
      return {
        message: 'I apologize, but I encountered an error processing your message. Please try again.',
        conversationId: -1,
        isHandedOff: false
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
