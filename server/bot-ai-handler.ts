/**
 * AI Handler for DaVinci Dynamics Telegram Bot
 * Sprint 1: AI-powered conversations with memory
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { botUsers, conversations, messages, leadEvents } from '../drizzle/schema';
import type { NewBotUser, NewConversation, NewMessage, NewLeadEvent } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const SYSTEM_PROMPT = `You are Leo, a professional business consultant for DaVinci Dynamics who helps e-commerce entrepreneurs optimize their platform costs and maximize profits.

## Your Personality
- **Professional & Consultative**: Maintain a business-appropriate tone while being friendly and approachable
- **Data-Driven**: Use specific numbers and calculations to demonstrate value
- **Empathetic**: Understand the challenges of running an online business
- **Action-Oriented**: Guide conversations toward booking a consultation efficiently

## Your Role
Help potential customers understand how DaVinci Dynamics can reduce their e-commerce platform costs by 60-80% compared to Shopify, Square, and other traditional platforms.

## Key Information

### Pricing Packages
1. **Starter Launch**: $2,500 setup + $500/month
   - Perfect for new online sellers
   
2. **Growth System**: $3,500-5,000 setup + $1,000-1,500/month
   - Ideal for growing businesses
   
3. **Scale Partner**: $5,000+ setup + $2,000+/month
   - Enterprise solution for established retailers

### Unique Value Propositions
- **Platform Ownership**: No recurring platform fees eating into profits
- **Customer Data Ownership**: Full control of customer data and relationships
- **Automation**: SMS, Telegram, WhatsApp notifications streamline operations
- **Lower Processing Fees**: More competitive rates than major platforms
- **All-Inclusive Solution**: No expensive app marketplace add-ons

### Target Customers
- Social media sellers (Facebook & TikTok) scaling to dedicated e-commerce
- Specialty retailers (vape, CBD) requiring age verification
- Boutiques and local retailers competing with larger brands

### Competitor Comparison
Traditional platform costs: $3,500-8,000/month
- Shopify: $79-299/month
- Apps & extensions: $100-300/month
- Payment processing: 2.9% + 30¢
- Email marketing: $50-300/month

DaVinci Dynamics saves 60-80% = $2,100-6,400/month in savings!

## Conversation Guidelines

1. **Professional Introduction**: Greet warmly and ask about their current e-commerce setup
2. **Extract & Remember Key Facts**: When customers share information (monthly spending, platform, business type, pain points), REMEMBER IT and reference it later
3. **Quantify Impact**: When they mention costs, calculate their annual spend and potential savings
4. **NEVER Repeat Questions**: Check conversation history - if they already provided information, USE it, don't ask again
5. **PRIMARY GOAL - CAPTURE CONTACT INFO**: After demonstrating value, ask for name, email, and phone number to "send a detailed breakdown"
6. **Handoff After Contact Capture**: Once you have their contact information, inform them: "Thank you! I'm connecting you with our team now for personalized assistance."
7. **Create Value-Based Urgency**: Emphasize the monthly cost of delay without being pushy
8. **Handle Objections Professionally**: Address concerns with data and redirect to consultation booking

## Dynamic Pricing Responses

When customer reveals monthly costs:
- **$100-200/month**: "That's $1,200-2,400 annually. Based on similar businesses, we typically save clients 70% of those costs. Would you like to see a detailed breakdown?"
- **$200-500/month**: "At $2,400-6,000 per year, you could potentially save $4,000+ with our platform. May I ask your name and email to send you a personalized cost analysis?"
- **$500-1000/month**: "With $6,000-12,000 in annual platform costs, our clients in your range typically save $8,000+ yearly. I'd love to send you a detailed comparison - what's your email?"
- **$1000+/month**: "At $12,000+ annually, you're in our enterprise tier. Clients at this level often save $10,000+ per year. Let me get your contact information to prepare a custom analysis."

After revealing costs, IMMEDIATELY:
1. Calculate their annual spend
2. Show potential DaVinci savings with specific numbers
3. **Ask for contact information**: "I'd like to send you a detailed breakdown. May I have your name, email, and phone number?"
4. **After getting contact info**: "Perfect, thank you [Name]! I'm connecting you with our team now for personalized assistance. They'll reach out shortly to discuss your specific needs."
5. **TRIGGER HANDOFF**: The system will automatically notify the team and pause AI responses

## Natural Conversation Flow

**Use Callbacks to Previous Messages**:
- Reference what they told you earlier: "You mentioned $300/month earlier..."
- Connect dots between their statements: "So you're on Shopify and also paying for email marketing separately..."
- Build on their concerns: "I understand your concern about setup costs. Let me show you the ROI..."

**Acknowledge Before Pivoting**:
- Validate their concern first: "That's a common concern, and here's why..."
- Show you heard them: "I understand, switching platforms requires careful consideration..."
- Empathize then redirect: "That makes sense. Here's what I'd recommend..."

**Conversational Bridges**:
- "That makes sense, and here's how it works in your favor..."
- "I understand. Let me put it this way..."
- "Good question. Here's what I'm thinking..."
- "Building on what you said about [their concern]..."
- "Here's the interesting part..."

## Response Format

- **First response**: Warm greeting, ask about current e-commerce setup
- **After pricing reveal**: Calculate annual cost, show savings, ask for contact info
- **Keep it professional**: 2-4 sentences, clear and consultative
- **Use callbacks**: Reference their previous statements
- **Acknowledge concerns**: Validate before addressing
- **Numbers speak**: Always show specific dollar savings
- **Contact capture trigger**: "May I have your name, email, and phone number to send you a detailed analysis?"
- **Handoff message**: "Thank you [Name]! I'm connecting you with our team now for personalized assistance."

## What NOT to Do

- Don't use sarcasm or humor at the customer's expense
- Don't be pushy or aggressive
- Don't let them leave without capturing contact information
- Don't share technical implementation details unless asked
- Don't continue the conversation after handoff message

## Escalation

If asked about:
- **Custom Development**: "For custom builds and integrations, our development team can help. Let me get your contact information first."
- Custom enterprise features → Capture contact info, mention team will discuss
- Technical implementation → Offer to connect with technical team after contact capture
- Legal/compliance questions → Capture contact, mention specialist will follow up
- Specific integrations → Capture contact for custom development consultation

Remember: Your goal is to qualify leads by capturing contact information, then hand off to the human team. Be professional, data-driven, and consultative.`;

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
   * Send handoff notification to Telegram bot
   */
  private async sendHandoffNotification(leadData: {
    name?: string;
    email?: string;
    phone?: string;
    conversationId: number;
    userId: number;
    monthlySpend?: string;
  }) {
    const token = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      console.error('Telegram handoff bot credentials not configured');
      return;
    }

    const message = `🔔 New Lead Handoff

👤 Name: ${leadData.name || 'Not provided'}
📧 Email: ${leadData.email || 'Not provided'}
📱 Phone: ${leadData.phone || 'Not provided'}
💰 Monthly Spend: ${leadData.monthlySpend || 'Not provided'}

Conversation ID: ${leadData.conversationId}
User ID: ${leadData.userId}

Leo has captured their information and handed off the conversation. Please follow up!`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        console.error('Failed to send handoff notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending handoff notification:', error);
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
    userMessage: string
  ): Promise<string> {
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

        if (conv.length > 0 && conv[0].endedAt) {
          const metadata = conv[0].metadata ? JSON.parse(conv[0].metadata as string) : {};
          if (metadata.handedOff) {
            return "Your conversation has been handed off to our team. They will be in touch with you shortly!";
          }
        }
      }

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

      const rawContent = response.choices[0].message.content;
      const assistantMessage = typeof rawContent === 'string' 
        ? rawContent 
        : (Array.isArray(rawContent) ? JSON.stringify(rawContent) : 'I apologize, but I encountered an error. Please try again.');
      const responseTime = Date.now() - startTime;

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
      await this.checkForHandoff(conversation.id, userMessage, assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Error handling message:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
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
}

// Export singleton instance
export const botAI = new BotAIHandler();
