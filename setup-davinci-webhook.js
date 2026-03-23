#!/usr/bin/env node

/**
 * Setup webhook for @DavinciDynamics_Chatbot
 */

import 'dotenv/config';

const BOT_TOKEN = process.env.DAVINCI_CHATBOT_TOKEN;
const WEBHOOK_URL = process.env.DAVINCI_WEBHOOK_URL || 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/api/davinci-chatbot-webhook';

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error('❌ DAVINCI_CHATBOT_TOKEN not found in environment variables');
    console.error('   Please add it to your .env file or set it as an environment variable');
    process.exit(1);
  }

  console.log('🔧 Setting up @DavinciDynamics_Chatbot webhook...');
  console.log('📍 Webhook URL:', WEBHOOK_URL);

  try {
    // Set webhook
    const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const setResult = await setResponse.json();
    
    if (!setResult.ok) {
      console.error('❌ Failed to set webhook:', setResult.description);
      process.exit(1);
    }

    console.log('✅ Webhook configured successfully!');
    console.log('📝 Result:', setResult.description);

    // Verify webhook
    console.log('\n🔍 Verifying webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = await infoResponse.json();

    if (info.ok) {
      console.log('✅ Webhook info:');
      console.log('   URL:', info.result.url);
      console.log('   Pending updates:', info.result.pending_update_count);
      console.log('   Last error:', info.result.last_error_message || 'None');
    }

    console.log('\n🎉 Setup complete! Your bot is now ready to receive link clicks.');
    console.log('💬 Start a chat with @DavinciDynamics_Chatbot to test.');
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    process.exit(1);
  }
}

setupWebhook();
