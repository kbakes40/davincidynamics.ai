# Telegram Routing Configuration Guide

## System Overview

The DaVinci Dynamics chat system now routes **ALL conversations to @DavinciDynamics_Chatbot** by default, where you (Leo) respond manually via Telegram. Messages appear seamlessly in the website chat - customers never know they're talking through Telegram.

---

## Default Behavior

**All new conversations automatically:**
1. Customer sends message on website → Forwarded to @DavinciDynamics_Chatbot
2. You reply in Telegram → Appears in website chat within 3 seconds
3. Customer stays on website the entire time (never sees Telegram)

**Timeout:** If no reply within **20 seconds**, customer sees: *"Thanks for waiting — we're reviewing your request now."*

---

## Manual Override Commands

Use these commands in @DavinciDynamics_Chatbot to switch conversation modes:

### `/takeback {conversation_id}`
**Switches conversation to AI mode** - Leo AI responds automatically on website (no Telegram routing)

**Example:**
```
/takeback 12345
```
**Response:** ✅ Conversation 12345 switched to AI mode. Leo AI will now respond automatically.

---

### `/handoffleo {conversation_id}`
**Switches conversation to bridge mode** - Routes back to Telegram for manual responses

**Example:**
```
/handoffleo 12345
```
**Response:** ✅ Conversation 12345 switched to bridge mode. You can now respond via Telegram.

---

## Message Format in Telegram

When a customer sends a message, you'll receive:

```
🎯 New Lead - Take Over Conversation

👤 John Smith
📧 john@example.com
📱 +1234567890
💰 Monthly Spend: $5000
🌐 Page: https://davincidynamics.ai/
💬 Customer: I'm interested in your e-commerce platform

Conversation ID: 12345

This customer is waiting on the website. Reply here and your message will appear in their chat window!
```

**To respond:** Simply type your message in the Telegram chat. It will automatically appear on the website within 3 seconds.

---

## How It Works

### Website → Telegram Flow
1. Customer opens chat widget on website
2. Conversation created with `mode: 'bridge'` (default)
3. Customer sends message
4. System forwards to @DavinciDynamics_Chatbot with conversation context
5. 20-second timeout starts

### Telegram → Website Flow
1. You reply in @DavinciDynamics_Chatbot
2. System parses conversation ID from notification
3. Message stored in database with `role: 'assistant'`
4. Website polling (every 3 seconds) fetches new messages
5. Customer sees your reply instantly in chat widget

---

## Testing the Flow

### Test 1: Default Bridge Mode
1. Open website chat widget
2. Send a test message
3. Check @DavinciDynamics_Chatbot for notification
4. Reply in Telegram
5. Verify reply appears on website within 3 seconds

### Test 2: Manual Override
1. Get conversation ID from Telegram notification
2. Send `/takeback {id}` in Telegram
3. Customer sends another message on website
4. Verify Leo AI responds automatically (no Telegram notification)
5. Send `/handoffleo {id}` to switch back

---

## Configuration Details

**Environment Variables:**
- `DAVINCI_CHATBOT_TOKEN` - @DavinciDynamics_Chatbot token
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID for receiving notifications
- `TELEGRAM_HANDOFF_BOT_TOKEN` - @Leo_Handoff_bot token (tracking only)

**Database Schema:**
- `conversations.mode` - Default: `'bridge'` (routes to Telegram)
- Options: `'ai'` (Leo AI responds) or `'bridge'` (manual Telegram)

**Timeout Settings:**
- Bridge mode timeout: **20 seconds**
- Fallback message: *"Thanks for waiting — we're reviewing your request now."*

---

## Troubleshooting

### Customer not receiving replies
1. Check @DavinciDynamics_Chatbot webhook is active
2. Verify conversation ID in your reply matches notification
3. Check server logs for delivery errors

### Not receiving notifications
1. Verify `TELEGRAM_CHAT_ID` is correct
2. Check `DAVINCI_CHATBOT_TOKEN` is valid
3. Confirm webhook is configured: `/home/ubuntu/hookah-pricing-screen/scripts/setup-davinci-webhook.ts`

### Want to switch default to AI mode
1. Update `drizzle/schema.ts`: Change `.default("bridge")` to `.default("ai")`
2. Run `pnpm db:push`
3. Restart server

---

## Key Files

- `server/bot-router.ts` - Main routing logic (checks mode, forwards to Telegram or AI)
- `server/bridge-forwarder.ts` - Telegram forwarding + 20s timeout
- `server/davinci-chatbot-handler.ts` - Receives Telegram replies, stores in database
- `server/conversation-commands.ts` - `/takeback` and `/handoffleo` implementation
- `client/src/components/GlassChatWidget.tsx` - Website chat with 3-second polling

---

## Next Steps

1. **Test the flow end-to-end** - Send a message on website, reply in Telegram, verify it appears
2. **Practice manual overrides** - Use `/takeback` and `/handoffleo` to switch modes
3. **Monitor logs** - Check server logs for any routing issues
4. **Customize timeout** - Adjust 20-second timeout in `bridge-forwarder.ts` if needed

---

**System Status:** ✅ All conversations route to @DavinciDynamics_Chatbot by default  
**Timeout:** 20 seconds  
**Manual Overrides:** `/takeback` and `/handoffleo` available  
**Tests:** All passing ✓
