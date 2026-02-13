# DaVinci Dynamics Telegram Bot

This bot handles customer interactions from the DaVinci Dynamics website, responding to different start parameters with relevant information about pricing, demos, and general inquiries.

## Features

- **Smart Start Parameters**: Responds differently based on how users arrive
  - `site_chat`: General welcome and chat options
  - `pricing`: Detailed pricing breakdown
  - `watch_demo`: Demo video links and platform features
  
- **Interactive Buttons**: Inline keyboard for easy navigation
- **Keyword Detection**: Responds to common questions about pricing, demos, and booking
- **Error Handling**: Graceful shutdown and error logging

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### 2. Get Your Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. **Important**: Send `/setcommands` to BotFather and set:
   ```
   start - Start chatting with DaVinci Dynamics Bot
   ```

### 3. Local Development

```bash
# Navigate to the telegram-bot directory
cd telegram-bot

# Install dependencies
npm install

# Set your bot token as environment variable
export TELEGRAM_BOT_TOKEN="your-bot-token-here"

# Run the bot
npm start

# Or run with auto-reload during development
npm run dev
```

### 4. Test the Bot

1. Open Telegram and search for your bot by username
2. Send `/start` - you should get a welcome message
3. Test the website links:
   - `https://t.me/YourBotUsername?start=site_chat`
   - `https://t.me/YourBotUsername?start=pricing`
   - `https://t.me/YourBotUsername?start=watch_demo`

### 5. Production Deployment

#### Option A: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set environment variable:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: Your bot token
5. Set start command: `node telegram-bot/bot.js`
6. Deploy!

#### Option B: Deploy to Heroku

```bash
# Install Heroku CLI
# Create new Heroku app
heroku create davinci-bot

# Set bot token
heroku config:set TELEGRAM_BOT_TOKEN="your-bot-token-here"

# Create Procfile in telegram-bot directory
echo "worker: node bot.js" > Procfile

# Deploy
git add .
git commit -m "Add Telegram bot"
git push heroku main

# Scale worker
heroku ps:scale worker=1
```

#### Option C: Deploy to VPS (Ubuntu)

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo or copy files
git clone your-repo-url
cd your-repo/telegram-bot

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Create .env file
echo "TELEGRAM_BOT_TOKEN=your-bot-token-here" > .env

# Start bot with PM2
pm2 start bot.js --name davinci-bot

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

#### Option D: Deploy to Manus (Recommended)

Since you're already using Manus for your website, you can deploy the bot here too:

```bash
# The bot is already in your project at /telegram-bot/
# Just run it as a background process

cd /home/ubuntu/hookah-pricing-screen/telegram-bot
npm install
nohup node bot.js > bot.log 2>&1 &
```

To make it persistent across sandbox restarts, add to a startup script.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your bot token from BotFather |

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start conversation with the bot |
| `/start site_chat` | General chat (from website) |
| `/start pricing` | View pricing information |
| `/start watch_demo` | Watch platform demos |

## Updating Website URLs

The bot currently links to:
- Booking page: `https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking`
- Mobile demo: `https://www.davincidynamics.site`
- Desktop demo: `https://www.bosshookah.site`

**Before deploying**, update these URLs in `bot.js` to your production URLs.

## Monitoring

### Check if bot is running:
```bash
# If using PM2
pm2 status

# If using nohup
ps aux | grep bot.js
```

### View logs:
```bash
# If using PM2
pm2 logs davinci-bot

# If using nohup
tail -f bot.log
```

### Restart bot:
```bash
# If using PM2
pm2 restart davinci-bot

# If using nohup
pkill -f bot.js
nohup node bot.js > bot.log 2>&1 &
```

## Troubleshooting

### Bot doesn't respond
1. Check if bot is running: `pm2 status` or `ps aux | grep bot.js`
2. Check logs for errors: `pm2 logs` or `tail -f bot.log`
3. Verify bot token is correct
4. Make sure bot is not blocked by user

### "Polling error" in logs
- Your bot token might be invalid
- Another instance might be running (stop all instances first)
- Network connectivity issues

### Buttons don't work
- Check that URLs are accessible
- Verify callback_data handlers are working
- Check bot logs for errors

## Support

For issues or questions:
- Check the logs first
- Verify environment variables are set
- Test with `/start` command
- Review Telegram Bot API docs: https://core.telegram.org/bots/api

## License

MIT
