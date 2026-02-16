# @DavinciDynamics_Chatbot Implementation

## Overview
Leo AI sales assistant that triggers on chatbot link clicks to qualify leads and book demos.

## Architecture

### 1. Trigger System
**Entry Points:**
- Button clicks (callback_query)
- Link clicks in messages (URL entities)
- Regular messages (fallback to generic intent)

### 2. Routing Flow
```
Telegram Update → Webhook → processUpdate() → handleLinkClick() → Leo AI → Response
```

### 3. Intent Classification
Automatically classifies user intent from link context:

| Intent | Triggers | Response Flow |
|--------|----------|---------------|
| **demo** | pricing, demo, savings, quote, book | Explain savings → Ask monthly spend → Invite booking |
| **solution** | features, platform, how it works | Explain benefits → Ask sales channel |
| **support** | contact, support, help | Triage → Ask primary issue |
| **hire** | fiverr, hire, project | Confirm project type → Ask timeline |
| **generic** | (default) | Ask: costs, conversions, or automation? |

### 4. Response Generation
**Leo System Prompt:**
- Straightforward, confident, helpful tone
- One qualifying question per turn
- Under 80 words (unless details requested)
- Never mentions automation/webhooks/internal systems
- Moves toward demo booking when relevant

**Pricing Info:**
- Setup: $2,500–$5,000
- Monthly: $500–$1,500
- Savings: 60–80% vs common stacks

**Fallback Message:**
> "Thanks for clicking that — I can help fast. What are you trying to solve first: lowering costs, improving conversions, or automating follow-up?"

## Files Created

### Core Logic
1. **`server/leo-link-handler.ts`**
   - Intent classification
   - Leo AI response generation
   - Context parsing
   - Conversation tracking

2. **`server/davinci-chatbot-handler.ts`**
   - Telegram webhook processing
   - Update routing (callback_query, messages, URL entities)
   - Message sending
   - Bot initialization

3. **`server/_core/index.ts`** (modified)
   - Added DaVinci bot initialization
   - Webhook endpoint registration

### Setup Scripts
4. **`setup-davinci-webhook.js`**
   - Automated webhook configuration
   - Verification and status check

## Webhook Endpoint
```
POST /api/davinci-chatbot-webhook
```

Accepts Telegram updates and processes:
- `callback_query` - Button clicks
- `message` with URL entities - Link clicks
- `message` with text - Regular messages

## Environment Variables Required

```bash
# Add to .env or secrets
DAVINCI_CHATBOT_TOKEN=<your_bot_token_from_@BotFather>
DAVINCI_WEBHOOK_URL=https://your-domain.com/api/davinci-chatbot-webhook
```

## Setup Instructions

### 1. Create Bot
```bash
# Talk to @BotFather on Telegram
/newbot
# Name: DaVinci Dynamics Chatbot
# Username: @DavinciDynamics_Chatbot
# Copy the bot token
```

### 2. Configure Environment
```bash
# Add to project secrets via webdev_request_secrets
DAVINCI_CHATBOT_TOKEN=<token_from_botfather>
```

### 3. Deploy & Set Webhook
```bash
# After deployment, run:
node setup-davinci-webhook.js
```

### 4. Test
1. Start chat with @DavinciDynamics_Chatbot
2. Send `/start`
3. Click any button or send a link
4. Leo should respond immediately

## Context Passed to Leo

```typescript
interface LinkClickContext {
  user_name?: string;        // Telegram first name
  user_id?: string;          // Telegram user ID
  chat_id?: string;          // Telegram chat ID
  session_id?: string;       // Alternative to chat_id
  link_label?: string;       // Button text or link anchor
  link_url?: string;         // Full URL if available
  page_url?: string;         // Source page (if tracked)
  last_user_message?: string; // Previous message text
  timestamp?: string;        // ISO timestamp
}
```

## Response Examples

### Demo Intent (clicked "Get Pricing")
```
Great timing! Most businesses we work with save 60-80% monthly compared to Shopify + apps. 

What's your current monthly spend on platform fees, payment processing, and add-ons? That'll help me show you exact savings.
```

### Solution Intent (clicked "How It Works")
```
We build you a custom e-commerce platform you own—no monthly platform fees eating your profits. 

Are you currently selling on Facebook/TikTok, or do you have an existing online store?
```

### Support Intent (clicked "Contact Us")
```
I can help right now. What's the main issue you need solved: lowering costs, improving conversions, or automating follow-up?
```

### Generic (no clear intent)
```
Thanks for clicking that — I can help fast. What are you trying to solve first: lowering costs, improving conversions, or automating follow-up?
```

## Conversation Storage

Leo stores interactions in the database:
- Link clicks logged as user messages with `intent: "link_click:{type}"`
- Leo responses logged as assistant messages with `intent: "leo_response:{type}"`
- Conversations linked to Telegram user ID
- Full context preserved for follow-up

## Error Handling

1. **LLM Failure** → Fallback message
2. **Database Unavailable** → Fallback message
3. **Invalid Update** → Logged, no response
4. **Bot Token Missing** → Bot disabled, logged

## Monitoring

Check logs for:
```bash
[DaVinci Bot] 📨 Received update
[DaVinci Bot] 🔘 Button clicked
[DaVinci Bot] 🔗 Link detected
[Leo Link Handler] Classified intent: {type}
[Leo Link Handler] Generated response
[DaVinci Bot] ✅ Message sent successfully
```

## Next Steps

1. **Add Inline Keyboards** - Create buttons for common flows (Get Pricing, Book Demo, etc.)
2. **Track Conversions** - Log when users book demos or provide contact info
3. **A/B Test Prompts** - Experiment with different Leo personalities
4. **Add Analytics** - Dashboard showing intent distribution and conversion rates
5. **Multi-language** - Detect language and respond accordingly
