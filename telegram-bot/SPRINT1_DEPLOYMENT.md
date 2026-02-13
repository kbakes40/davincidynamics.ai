# Sprint 1 Deployment Guide

## ✅ What's Been Built

Sprint 1 has successfully implemented the AI foundation for your Telegram bot:

### Backend Components
- **Database Schema**: Tables for bot_users, conversations, messages, and lead_events
- **AI Handler**: Server-side module using Manus LLM integration with conversation memory
- **tRPC API**: Exposed bot endpoints at `/api/trpc/bot.*`
- **Analytics Dashboard**: Web UI at `/bot-analytics` to view conversation metrics

### Bot Components
- **AI-Powered Bot** (`bot-ai.js`): New bot that calls server API for intelligent responses
- **Original Bot** (`bot.js`): Keyword-based bot (kept as backup)

---

## 🚀 Deployment Steps

### Step 1: Update Environment Variables

The bot needs to know where your server is deployed. Add to your `.env`:

```bash
# For local development
SERVER_URL=http://localhost:3000

# For production (after you publish the website)
SERVER_URL=https://your-app.manus.space
```

### Step 2: Test Locally

Before deploying, test the AI bot locally:

```bash
# Terminal 1: Start the main server
cd /home/ubuntu/hookah-pricing-screen
pnpm dev

# Terminal 2: Start the AI bot
cd /home/ubuntu/hookah-pricing-screen/telegram-bot
TELEGRAM_BOT_TOKEN="your-token" SERVER_URL="http://localhost:3000" node bot-ai.js
```

Send a message to your bot on Telegram and verify it responds with AI-generated answers.

### Step 3: Deploy to Production

#### Option A: Railway (Recommended)

1. **Create new Railway project** for the bot:
   ```bash
   cd telegram-bot
   railway init
   ```

2. **Set environment variables** in Railway dashboard:
   - `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
   - `SERVER_URL`: Your published website URL (e.g., `https://your-app.manus.space`)

3. **Deploy**:
   ```bash
   railway up
   ```

#### Option B: Run on VPS

1. **Copy files to server**:
   ```bash
   scp -r telegram-bot/ user@your-server:/opt/davinci-bot/
   ```

2. **Install dependencies**:
   ```bash
   ssh user@your-server
   cd /opt/davinci-bot
   npm install
   ```

3. **Create systemd service** (`/etc/systemd/system/davinci-bot.service`):
   ```ini
   [Unit]
   Description=DaVinci Dynamics Telegram Bot
   After=network.target

   [Service]
   Type=simple
   User=nodejs
   WorkingDirectory=/opt/davinci-bot
   Environment=TELEGRAM_BOT_TOKEN=your-token-here
   Environment=SERVER_URL=https://your-app.manus.space
   ExecStart=/usr/bin/node bot-ai.js
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start service**:
   ```bash
   sudo systemctl enable davinci-bot
   sudo systemctl start davinci-bot
   sudo systemctl status davinci-bot
   ```

#### Option C: PM2 (Simple)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
cd telegram-bot
pm2 start bot-ai.js --name davinci-bot \
  --env TELEGRAM_BOT_TOKEN=your-token \
  --env SERVER_URL=https://your-app.manus.space

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 📊 Accessing Analytics

After deployment, you can view bot analytics at:

```
https://your-app.manus.space/bot-analytics
```

To find a user's Telegram ID:
1. Have them send a message to your bot
2. Check server logs for their user ID
3. Enter that ID in the analytics dashboard

---

## 🧪 Testing the AI Integration

### Test Conversation Flow

1. **Start chat**: Send `/start site_chat` to your bot
2. **Ask questions**: 
   - "How much does it cost?"
   - "What's the difference between your packages?"
   - "Can you help me migrate from Shopify?"
3. **Verify AI responses**: Bot should give contextual, conversational answers
4. **Check analytics**: Visit `/bot-analytics` and search for your Telegram user ID

### Expected Behavior

✅ Bot remembers context from previous messages  
✅ Responses are natural and conversational  
✅ Bot provides specific pricing and feature information  
✅ Conversations are stored in database  
✅ Analytics dashboard shows metrics  

---

## 🔧 Troubleshooting

### Bot not responding

**Check server logs**:
```bash
# In your main project
cd /home/ubuntu/hookah-pricing-screen
pnpm dev
# Look for errors in terminal
```

**Check bot logs**:
```bash
# If using PM2
pm2 logs davinci-bot

# If using systemd
sudo journalctl -u davinci-bot -f
```

### "Database not available" error

Make sure your database is running and `DATABASE_URL` is set in your environment.

### AI responses are slow

This is normal - LLM API calls can take 1-3 seconds. The bot shows a "typing" indicator while waiting.

### Fallback responses instead of AI

If you see generic fallback responses, the AI API call failed. Check:
1. Server is running and accessible
2. `SERVER_URL` is correct in bot environment
3. No firewall blocking bot → server communication

---

## 📈 Monitoring

### Key Metrics to Track

- **Response Time**: How long AI takes to respond
- **Conversation Length**: Average messages per conversation
- **Fallback Rate**: How often AI fails and uses fallback
- **User Engagement**: Repeat conversations from same users

### Logging

The bot logs all important events:
- `📨` New messages received
- `✅` AI responses sent
- `❌` Errors encountered

Monitor these logs to identify issues early.

---

## 🎯 Next Steps (Sprint 2)

After Sprint 1 is deployed and stable, you can move to Sprint 2:

1. **Lead Scoring**: Automatically score leads based on conversation quality
2. **Sales Notifications**: Alert you when hot leads are identified
3. **Lead Dashboard**: View all leads and their scores in one place

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs** (both server and bot)
2. **Verify environment variables** are set correctly
3. **Test locally first** before deploying to production
4. **Review error messages** - they usually point to the problem

---

**Deployment Checklist**:

- [ ] Database schema pushed (`pnpm db:push`)
- [ ] Server deployed and accessible
- [ ] `TELEGRAM_BOT_TOKEN` set in bot environment
- [ ] `SERVER_URL` points to your published website
- [ ] Bot deployed and running
- [ ] Test conversation works
- [ ] Analytics dashboard accessible
- [ ] Logs are being monitored

Once all items are checked, Sprint 1 is complete! 🎉
