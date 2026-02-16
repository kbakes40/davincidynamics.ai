/**
 * Setup Telegram Webhook for @Leo_Handoff_bot
 * Run this script to configure the bot to send messages to your server
 */

import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/api/trpc/bot.telegramWebhook';

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_HANDOFF_BOT_TOKEN not found in environment variables');
    process.exit(1);
  }

  console.log('🔧 Setting up Telegram webhook...');
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);

  try {
    // Set webhook
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message'],
        drop_pending_updates: true, // Clear any pending updates
      }),
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook configured successfully!');
      console.log('📝 Result:', result.description);
    } else {
      console.error('❌ Failed to set webhook:', result.description);
      process.exit(1);
    }

    // Verify webhook info
    console.log('\n🔍 Verifying webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = await infoResponse.json();

    if (info.ok) {
      console.log('✅ Webhook info:');
      console.log(`   URL: ${info.result.url}`);
      console.log(`   Pending updates: ${info.result.pending_update_count}`);
      console.log(`   Last error: ${info.result.last_error_message || 'None'}`);
      
      if (info.result.last_error_date) {
        const errorDate = new Date(info.result.last_error_date * 1000);
        console.log(`   Last error date: ${errorDate.toISOString()}`);
      }
    }

    console.log('\n🎉 Setup complete! Your bot is now ready to receive messages.');
    console.log('💬 Send a message to @Leo_Handoff_bot to test the webhook.');

  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
