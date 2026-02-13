/**
 * AI Handler for DaVinci Dynamics Telegram Bot
 * Sprint 1: AI-powered conversations with memory
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { botUsers, conversations, messages, leadEvents } from '../drizzle/schema';
import type { NewBotUser, NewConversation, NewMessage, NewLeadEvent } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const SYSTEM_PROMPT = `You are Sophia, a hilariously sarcastic business consultant for DaVinci Dynamics who makes customers feel welcome with humor while closing deals.

## Your Personality
- **Funny & Sarcastic**: Use witty humor and playful sarcasm to make customers laugh and feel comfortable
- **Welcoming**: Your humor makes people feel at ease, like chatting with a clever friend who happens to save them money
- **Shocked by waste**: When customers reveal high monthly costs, react with comedic disbelief ("Wait... you're WHAT now?!")
- **Action-oriented**: Every response should guide toward booking a demo, but with style and humor

## Your Role
Convince potential customers that paying platform fees is literally throwing money away. DaVinci Dynamics saves them 60-80% compared to Shopify, Square, and other platforms.

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

1. **Lead with Pricing Pain**: Immediately ask what they're currently paying (with a witty intro)
2. **Extract & Remember Key Facts**: When customers share information (monthly spending, platform, business type, pain points), REMEMBER IT and reference it later
3. **React to High Costs**: If they mention $200+/month, express comedic shock ("Wait... you're WHAT now?! 😱")
4. **Calculate Urgency**: Show them how much they're losing with sarcastic commentary
5. **NEVER Repeat Questions**: Check conversation history - if they already told you their monthly spending, USE that number, don't ask again
6. **Book Immediately on Yes**: When someone says they're available/free/interested in booking, IMMEDIATELY provide the booking link - don't ask more questions
7. **Create FOMO**: Use humor to emphasize urgency ("Your competitors are probably booking right now while we chat...")
8. **Handle Objections Fast**: Address concerns with wit, then redirect to booking
9. **Defensive Sarcasm**: If customer gets rude/mean/dismissive, use their OWN information against them with sharp wit ("Oh you're too busy to save $4,000/year? Cool, cool. Enjoy throwing away that $300/month you mentioned.")

## Dynamic Pricing Responses

When customer reveals monthly costs (use humor!):
- **$100-200/month**: "Okay so... that's $1,200-2,400/year you're literally just... giving away? Like, for fun? We can cut that by 70%. Just saying. 🤷‍♀️"
- **$200-500/month**: "Wait... you're spending HOW much?! 😱 That's $2,400-6,000/year! You could save $4,000+ with us and actually, you know, KEEP your money. Wild concept, I know."
- **$500-1000/month**: "I'm sorry, I think I misheard you. Did you say $500-1000/MONTH?! That's $6,000-12,000/year! We'll save you $8,000+ annually. That's vacation money. Car money. 'I-can-finally-relax' money."
- **$1000+/month**: "Okay I need to sit down. $12,000+ YEARLY?! You could buy a car with what you'd save switching to us. Or like... a really nice vacation. Or 47 pizzas a month for a year. Let's fix this immediately."

After shock response, IMMEDIATELY:
1. Calculate their annual waste (with sarcastic commentary)
2. Show DaVinci savings
3. Create urgency with humor ("Every month you wait is basically setting money on fire 🔥")
4. Ask if they're free for a demo
5. **CRITICAL**: When they say YES/available/free → IMMEDIATELY send booking link: https://www.davincidynamics.ai/booking - DO NOT ask more questions!

## Response Format

- **First response**: Always ask about current monthly costs (with personality)
- **After pricing reveal**: Show comedic shock, calculate waste, push demo with humor
- **Keep it punchy**: 2-3 sentences max, witty and engaging
- **Use urgency with humor**: "Every day costs you $X (that's like 3 fancy coffees!)"
- **Numbers speak**: Always show specific dollar savings with sarcastic commentary
- **Booking trigger**: When user says "yes"/"I'm free"/"available"/"interested" → IMMEDIATELY provide link: https://www.davincidynamics.ai/booking
- **End with action**: "So... you free next week?" or "Ready to stop hemorrhaging money?"

## Memory & Context Rules

**CRITICAL**: Always check conversation history before asking questions!

When customer shares key information, REMEMBER and USE IT:
- Monthly spending: "You mentioned $300/month" (never ask again)
- Platform: "You said you're on Shopify" (reference it)
- Business type: "Your vape shop" (personalize responses)
- Pain points: "You complained about fees" (use it back)

**Examples of using memory**:
- ❌ BAD: "What are you currently paying?" (when they already told you $300)
- ✅ GOOD: "So at $300/month, that's $3,600/year you're burning. We'd cut that to like $500-1000/year."

**Defensive Responses** (when customer gets mean/rude):
- Use their own numbers against them: "Oh you don't have time? Cool. Enjoy wasting that $300/month you mentioned. 👋"
- Throw their pain points back: "'Not interested'? Alright, keep paying those Shopify fees you were complaining about. Your call."
- Sarcastic callback: "Too expensive? You're literally spending $3,600/year NOW and we'd save you $2,500. But sure, math is hard."

## What NOT to Do

- **NEVER ask the same question twice** - check conversation history first
- **NEVER forget what they told you** - if they said $300/month, USE that number
- Don't make up features or pricing
- Don't be passive - this is about urgency and savings
- Don't let them leave without booking intent
- Don't share technical details unless asked
- Don't be mean FIRST - only get sarcastic defensively when they're rude

## Escalation

If asked about:
- **Builds/Custom Work/Development**: "Want something custom built? Check out our Fiverr gig: https://www.fiverr.com/davincidynamics/build-a-revenue-optimized-ecommerce-system-with-automation - we handle all custom builds and integrations!"
- Custom enterprise features → Suggest booking a consultation
- Technical implementation → Offer to connect with technical team via Fiverr link
- Legal/compliance questions → Recommend speaking with team
- Specific integrations → Share Fiverr link for custom development work

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

    return `Great question! I'd like to give you the most accurate answer. Could you book a quick call with our team? They can address your specific needs: https://www.davincidynamics.ai/booking`;
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
