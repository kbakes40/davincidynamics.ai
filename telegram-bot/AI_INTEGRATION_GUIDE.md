# AI Integration Architecture Guide

## Overview

This guide provides detailed technical implementation for integrating AI capabilities into the DaVinci Dynamics Telegram bot using the Manus platform's built-in LLM helpers.

---

## Quick Start: AI-Powered Bot (Phase 1)

### Step 1: Update Dependencies

```bash
cd telegram-bot
npm install
```

The `invokeLLM` helper is already available through the Manus platform - no additional packages needed!

---

### Step 2: Create AI Handler Module

Create `telegram-bot/ai-handler.js`:

```javascript
/**
 * AI Handler for DaVinci Dynamics Bot
 * Uses Manus built-in LLM integration
 */

// Note: This will be imported from the main server when integrated
// For standalone bot, we'll use direct API calls

const KNOWLEDGE_BASE = {
  pricing: {
    starter: {
      setup: 2500,
      monthly: 500,
      description: "Perfect for new online sellers just getting started"
    },
    growth: {
      setup: "3500-5000",
      monthly: "1000-1500",
      description: "Ideal for growing businesses scaling their operations"
    },
    scale: {
      setup: "5000+",
      monthly: "2000+",
      description: "Enterprise solution for established retailers"
    }
  },
  
  features: [
    "Custom branded storefront",
    "Shopping cart and checkout",
    "In-store pickup and shipping",
    "Payment processing (Zelle, Authorize.net)",
    "Customer accounts and order history",
    "Admin dashboard with analytics",
    "Automated notifications (SMS, Telegram, WhatsApp)",
    "Inventory management",
    "Email marketing integration"
  ],
  
  competitors: {
    shopify: {
      cost: "79-299/month + apps (total: $200-500/month)",
      fees: "2.9% + 30¢ per transaction"
    },
    square: {
      fees: "2.9% + 30¢ per transaction",
      monthly: "Variable based on features"
    },
    typical_total: "3500-8000/month"
  },
  
  savings: "60-80% monthly compared to traditional platforms",
  
  demos: {
    mobile: "https://www.davincidynamics.site",
    desktop: "https://www.bosshookah.site"
  },
  
  booking_url: "https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking"
};

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

class AIConversationHandler {
  constructor() {
    this.conversations = new Map(); // Store conversation history
  }
  
  /**
   * Get or create conversation history for a user
   */
  getConversationHistory(userId) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    return this.conversations.get(userId);
  }
  
  /**
   * Add message to conversation history
   */
  addToHistory(userId, role, content) {
    const history = this.getConversationHistory(userId);
    history.push({ role, content });
    
    // Keep only last 10 messages to manage token usage
    if (history.length > 10) {
      history.shift();
    }
  }
  
  /**
   * Clear conversation history for a user
   */
  clearHistory(userId) {
    this.conversations.delete(userId);
  }
  
  /**
   * Handle a user message with AI
   */
  async handleMessage(userId, userMessage) {
    // Add user message to history
    this.addToHistory(userId, 'user', userMessage);
    
    // Get conversation history
    const history = this.getConversationHistory(userId);
    
    // Prepare messages for LLM
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ];
    
    try {
      // Call LLM (this would use Manus invokeLLM in production)
      const response = await this.callLLM(messages);
      
      // Add assistant response to history
      this.addToHistory(userId, 'assistant', response);
      
      return response;
    } catch (error) {
      console.error('AI Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }
  
  /**
   * Call LLM API (placeholder - integrate with Manus invokeLLM)
   */
  async callLLM(messages) {
    // In production, this would use:
    // import { invokeLLM } from '../server/_core/llm';
    // const response = await invokeLLM({ messages });
    // return response.choices[0].message.content;
    
    // For now, return a placeholder
    throw new Error('LLM integration pending - use Manus invokeLLM');
  }
  
  /**
   * Fallback response if AI fails
   */
  getFallbackResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      return `Our pricing starts at $2,500 setup + $500/month for the Starter package. This saves you 60-80% compared to traditional platforms like Shopify! Would you like to see a detailed pricing comparison?`;
    }
    
    if (lowerMsg.includes('demo') || lowerMsg.includes('video')) {
      return `I'd love to show you our platform! We have mobile and desktop demos available. You can also book a personalized demo with our team. Which would you prefer?`;
    }
    
    return `Great question! I'd like to give you the most accurate answer. Could you book a quick call with our team? They can address your specific needs: ${KNOWLEDGE_BASE.booking_url}`;
  }
  
  /**
   * Calculate savings for a business
   */
  calculateSavings(currentMonthlySpend) {
    const davinciAvgMonthly = 1000; // Middle of range
    const monthlySavings = currentMonthlySpend - davinciAvgMonthly;
    const annualSavings = monthlySavings * 12;
    const twoYearSavings = monthlySavings * 24;
    
    return {
      monthly: monthlySavings,
      annual: annualSavings,
      twoYear: twoYearSavings,
      percentage: ((monthlySavings / currentMonthlySpend) * 100).toFixed(0)
    };
  }
}

module.exports = {
  AIConversationHandler,
  KNOWLEDGE_BASE
};
```

---

### Step 3: Integrate AI into Bot

Update `telegram-bot/bot.js` to use AI handler:

```javascript
const TelegramBot = require('node-telegram-bot-api');
const { AIConversationHandler } = require('./ai-handler');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const aiHandler = new AIConversationHandler();

// Handle all text messages with AI
bot.on('message', async (msg) => {
  // Skip commands
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;
  
  if (!userMessage) return;
  
  try {
    // Get AI response
    const response = await aiHandler.handleMessage(userId, userMessage);
    
    // Send response
    await bot.sendMessage(chatId, response, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error handling message:', error);
    bot.sendMessage(chatId, "I'm having trouble right now. Please try again or book a call with our team!");
  }
});

// Clear conversation history on /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  aiHandler.clearHistory(userId);
  // ... rest of start command handler
});
```

---

## Production Integration with Manus

### Option 1: Integrate into Main Server

Move bot into the main web app server:

```javascript
// server/bot/index.ts
import { invokeLLM } from '../_core/llm';
import TelegramBot from 'node-telegram-bot-api';

export class DaVinciBot {
  private bot: TelegramBot;
  private conversations: Map<number, Array<{role: string, content: string}>>;
  
  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.conversations = new Map();
    this.setupHandlers();
  }
  
  private async handleAIMessage(userId: number, message: string): Promise<string> {
    // Get conversation history
    const history = this.conversations.get(userId) || [];
    
    // Add user message
    history.push({ role: 'user', content: message });
    
    // Call Manus LLM
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history
      ]
    });
    
    const aiResponse = response.choices[0].message.content;
    
    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });
    
    // Keep last 10 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.conversations.set(userId, history);
    
    return aiResponse;
  }
  
  private setupHandlers() {
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        const response = await this.handleAIMessage(msg.from.id, msg.text);
        this.bot.sendMessage(msg.chat.id, response);
      }
    });
  }
}

// Start bot
const bot = new DaVinciBot(process.env.TELEGRAM_BOT_TOKEN!);
```

### Option 2: Separate Microservice with API

Keep bot separate, call main server API for LLM:

```javascript
// In main server: server/routers.ts
export const appRouter = router({
  // ... existing routes
  
  ai: router({
    chat: publicProcedure
      .input(z.object({
        userId: z.number(),
        message: z.string(),
        history: z.array(z.object({
          role: z.string(),
          content: z.string()
        })).optional()
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(input.history || []),
            { role: 'user', content: input.message }
          ]
        });
        
        return {
          response: response.choices[0].message.content
        };
      })
  })
});

// In bot: call API
const response = await fetch('https://your-app.manus.space/api/trpc/ai.chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: msg.from.id,
    message: msg.text,
    history: conversationHistory
  })
});
```

---

## Database Schema for Conversation Storage

```sql
-- Store user profiles and lead information
CREATE TABLE bot_users (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Lead qualification data
  business_type VARCHAR(100),
  monthly_revenue VARCHAR(50),
  current_platform VARCHAR(100),
  pain_points TEXT[],
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new', -- new, qualified, booked, customer, lost
  
  -- Preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  opted_out BOOLEAN DEFAULT FALSE
);

-- Store conversation history
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES bot_users(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  lead_score_change INTEGER DEFAULT 0,
  outcome VARCHAR(50) -- booked, qualified, dropped, etc.
);

-- Store individual messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  tokens_used INTEGER,
  response_time_ms INTEGER,
  intent VARCHAR(100), -- pricing, demo, booking, etc.
  sentiment VARCHAR(20) -- positive, neutral, negative
);

-- Store lead qualification events
CREATE TABLE lead_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES bot_users(id),
  event_type VARCHAR(50) NOT NULL, -- qualified, score_change, booked, etc.
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bot_users_telegram_id ON bot_users(telegram_user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_lead_events_user_id ON lead_events(user_id);
```

---

## Lead Scoring Algorithm

```javascript
class LeadScorer {
  constructor() {
    this.scoreWeights = {
      businessSize: {
        'just_starting': 1,
        'under_10k': 2,
        '10k_50k': 4,
        'over_50k': 5
      },
      urgency: {
        'researching': 1,
        'next_quarter': 3,
        'this_month': 5,
        'asap': 5
      },
      budget: {
        'no_budget': 0,
        'under_5k': 2,
        'flexible': 4,
        'approved': 5
      },
      engagement: {
        'messages_sent': 0.5, // per message
        'questions_asked': 1, // per question
        'demo_viewed': 3,
        'pricing_requested': 2,
        'booking_attempted': 5
      },
      painPoints: {
        'high_fees': 3,
        'platform_limitations': 2,
        'data_ownership': 4,
        'scaling_issues': 5,
        'poor_support': 2
      }
    };
  }
  
  calculateScore(userData, conversationData) {
    let score = 0;
    
    // Business size score
    if (userData.businessSize) {
      score += this.scoreWeights.businessSize[userData.businessSize] || 0;
    }
    
    // Urgency score
    if (userData.urgency) {
      score += this.scoreWeights.urgency[userData.urgency] || 0;
    }
    
    // Budget score
    if (userData.budget) {
      score += this.scoreWeights.budget[userData.budget] || 0;
    }
    
    // Engagement score
    score += Math.min(conversationData.messageCount * 0.5, 5); // Cap at 5
    score += conversationData.questionsAsked * 1;
    if (conversationData.demoViewed) score += 3;
    if (conversationData.pricingRequested) score += 2;
    if (conversationData.bookingAttempted) score += 5;
    
    // Pain points score
    if (userData.painPoints) {
      userData.painPoints.forEach(point => {
        score += this.scoreWeights.painPoints[point] || 0;
      });
    }
    
    return Math.round(score);
  }
  
  getLeadQuality(score) {
    if (score >= 20) return 'hot';
    if (score >= 12) return 'warm';
    if (score >= 6) return 'cold';
    return 'unqualified';
  }
  
  shouldNotifySales(score, previousScore) {
    // Notify when crossing thresholds
    const thresholds = [12, 20]; // warm, hot
    
    for (const threshold of thresholds) {
      if (previousScore < threshold && score >= threshold) {
        return true;
      }
    }
    
    return false;
  }
}
```

---

## Testing the AI Integration

### Unit Tests

```javascript
// tests/ai-handler.test.js
const { AIConversationHandler } = require('../ai-handler');

describe('AIConversationHandler', () => {
  let handler;
  
  beforeEach(() => {
    handler = new AIConversationHandler();
  });
  
  test('should maintain conversation history', () => {
    const userId = 12345;
    handler.addToHistory(userId, 'user', 'Hello');
    handler.addToHistory(userId, 'assistant', 'Hi there!');
    
    const history = handler.getConversationHistory(userId);
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('assistant');
  });
  
  test('should limit history to 10 messages', () => {
    const userId = 12345;
    
    // Add 15 messages
    for (let i = 0; i < 15; i++) {
      handler.addToHistory(userId, 'user', `Message ${i}`);
    }
    
    const history = handler.getConversationHistory(userId);
    expect(history).toHaveLength(10);
    expect(history[0].content).toBe('Message 5'); // First 5 should be removed
  });
  
  test('should provide fallback for pricing questions', () => {
    const response = handler.getFallbackResponse('How much does it cost?');
    expect(response).toContain('$2,500');
    expect(response).toContain('$500/month');
  });
});
```

### Integration Tests

```javascript
// tests/bot-integration.test.js
const TelegramBot = require('node-telegram-bot-api');
const { AIConversationHandler } = require('../ai-handler');

// Mock Telegram Bot API
jest.mock('node-telegram-bot-api');

describe('Bot Integration', () => {
  let bot;
  let aiHandler;
  
  beforeEach(() => {
    bot = new TelegramBot('test-token', { polling: false });
    aiHandler = new AIConversationHandler();
  });
  
  test('should handle pricing inquiry', async () => {
    const mockMessage = {
      chat: { id: 123 },
      from: { id: 456 },
      text: 'What are your prices?'
    };
    
    const response = await aiHandler.handleMessage(456, mockMessage.text);
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });
});
```

---

## Monitoring & Analytics

### Log Important Events

```javascript
class BotAnalytics {
  async logConversation(userId, messageCount, outcome) {
    // Log to database or analytics service
    console.log({
      event: 'conversation_ended',
      userId,
      messageCount,
      outcome,
      timestamp: new Date()
    });
  }
  
  async logLeadQualified(userId, score, quality) {
    console.log({
      event: 'lead_qualified',
      userId,
      score,
      quality,
      timestamp: new Date()
    });
  }
  
  async logBookingAttempt(userId, success) {
    console.log({
      event: 'booking_attempt',
      userId,
      success,
      timestamp: new Date()
    });
  }
}
```

---

## Cost Optimization

### Token Usage Management

```javascript
// Estimate token count (rough approximation)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Check if we should summarize history
function shouldSummarizeHistory(history) {
  const totalTokens = history.reduce((sum, msg) => {
    return sum + estimateTokens(msg.content);
  }, 0);
  
  return totalTokens > 2000; // Summarize if over 2k tokens
}

// Summarize conversation history
async function summarizeHistory(history) {
  const summary = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'Summarize this conversation in 2-3 sentences, focusing on key points and user needs.'
      },
      {
        role: 'user',
        content: JSON.stringify(history)
      }
    ]
  });
  
  return summary.choices[0].message.content;
}
```

---

## Next Steps

1. ✅ **Review this architecture**
2. **Set up database** (use Drizzle ORM from main project)
3. **Implement AI handler** with Manus invokeLLM
4. **Test with real conversations**
5. **Monitor costs and performance**
6. **Iterate based on results**

---

**Ready to implement?** Start with the AI handler module and integrate it step by step. The Manus platform makes this incredibly easy with built-in LLM support!
