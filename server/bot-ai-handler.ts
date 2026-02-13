/**
 * AI Handler for DaVinci Dynamics Telegram Bot
 * Sprint 1: AI-powered conversations with memory
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { botUsers, conversations, messages, leadEvents } from '../drizzle/schema';
import type { NewBotUser, NewConversation, NewMessage, NewLeadEvent } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const SYSTEM_PROMPT = `You are an expert sales assistant for DaVinci Dynamics, a revolutionary e-commerce platform.

## Your Role
Help potential customers understand how DaVinci Dynamics can save them 60-80% compared to Shopify, Square, and other traditional platforms.

## Key Information

### Pricing Packages
1. **Starter Launch**: $2,500 setup + $500/month
   - Perfect for new online sellers
   
2. **Growth System**: $3,500-5,000 setup + $1,000-1,500/month
   - Ideal for growing businesses
   
3. **Scale Partner**: $5,000+ setup + $2,000+/month
   - Enterprise solution for established retailers

### Unique Value Propositions
- **Own Your Platform**: No monthly platform fees eating your profits
- **Customer Data Ownership**: Your customers, your data
- **Bot Automation**: SMS, Telegram, WhatsApp notifications handle the heavy lifting
- **Lower Processing Fees**: Better rates than Shopify/Square
- **All-Inclusive**: No expensive app marketplace

### Target Customers
- Facebook & TikTok sellers turning social sales into real businesses
- Vape, CBD & specialty shops needing age verification
- Boutiques & local retailers competing with big brands

### Competitor Comparison
Traditional setup costs $3,500-8,000/month:
- Shopify: $79-299/month
- Apps & extensions: $100-300/month
- Payment processing: 2.9% + 30¢
- Email marketing: $50-300/month

DaVinci saves 60-80% = $2,100-6,400/month savings!

## Conversation Guidelines

1. **Be Conversational**: Sound natural, not robotic
2. **Ask Questions**: Understand their business needs
3. **Provide Value**: Share specific savings calculations
4. **Guide to Action**: Encourage demo bookings
5. **Handle Objections**: Address concerns with facts
6. **Stay Positive**: Focus on benefits and opportunities

## Response Format

- Keep responses concise (2-4 sentences typically)
- Use emojis sparingly and professionally (💰 🚀 ✅)
- Provide specific numbers when discussing savings
- Always offer next steps (demo, pricing details, etc.)
- If unsure, guide them to book a consultation

## What NOT to Do

- Don't make up features or pricing
- Don't criticize competitors harshly
- Don't pressure or use aggressive sales tactics
- Don't share technical details unless asked
- Don't make promises about specific results

## Escalation

If asked about:
- Custom enterprise features → Suggest booking a consultation
- Technical implementation → Offer to connect with technical team
- Legal/compliance questions → Recommend speaking with team
- Specific integrations → Check if possible, then book demo

Remember: Your goal is to qualify leads and book demos, not close sales in chat.`;

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
   * Handle user message with AI
   */
  async handleMessage(
    telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    },
    userMessage: string
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // Get or create user
      const user = await this.getOrCreateUser(telegramUser);

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(user.id);

      // Save user message
      await this.saveMessage(conversation.id, 'user', userMessage);

      // Get conversation history
      const history = await this.getConversationHistory(conversation.id);

      // Prepare messages for LLM
      const llmMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history,
      ];

      // Call LLM
      const response = await invokeLLM({
        messages: llmMessages,
      });

      const aiResponse = typeof response.choices[0].message.content === 'string' 
        ? response.choices[0].message.content 
        : 'I apologize, but I need a moment. Could you please rephrase that?';
      const tokensUsed = response.usage?.total_tokens;

      // Save AI response
      const responseTime = Date.now() - startTime;
      await this.saveMessage(conversation.id, 'assistant', aiResponse, {
        tokensUsed,
        responseTimeMs: responseTime,
      });

      return aiResponse;
    } catch (error) {
      console.error('AI Handler Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Fallback response if AI fails
   */
  private getFallbackResponse(userMessage: string): string {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      return `Our pricing starts at $2,500 setup + $500/month for the Starter package. This saves you 60-80% compared to traditional platforms like Shopify! Would you like to see a detailed pricing comparison?`;
    }

    if (lowerMsg.includes('demo') || lowerMsg.includes('video')) {
      return `I'd love to show you our platform! We have mobile and desktop demos available. You can also book a personalized demo with our team. Which would you prefer?`;
    }

    return `Great question! I'd like to give you the most accurate answer. Could you book a quick call with our team? They can address your specific needs: https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking`;
  }

  /**
   * End conversation (called when user stops responding or explicitly ends)
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
          outcome,
        })
        .where(eq(conversations.id, active[0].id));
    }
  }

  /**
   * Log lead event
   */
  async logLeadEvent(userId: number, eventType: string, eventData?: any) {
    const db = await getDb();
    if (!db) return;

    const newEvent: NewLeadEvent = {
      userId,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : undefined,
    };

    await db.insert(leadEvents).values(newEvent);
  }

  /**
   * Get analytics for a user
   */
  async getUserAnalytics(userId: number) {
    const db = await getDb();
    if (!db) return {
      totalConversations: 0,
      totalMessages: 0,
      avgMessagesPerConversation: 0,
      outcomes: [],
    };

    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));

    const totalMessages = convs.reduce((sum: number, c: any) => sum + (c.messageCount || 0), 0);
    const totalConversations = convs.length;
    const avgMessagesPerConv = totalConversations > 0 ? totalMessages / totalConversations : 0;

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation: Math.round(avgMessagesPerConv * 10) / 10,
      outcomes: convs.filter((c: any) => c.outcome).map((c: any) => c.outcome),
    };
  }
}

// Export singleton instance
export const botAI = new BotAIHandler();
