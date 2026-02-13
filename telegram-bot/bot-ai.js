/**
 * DaVinci Dynamics Telegram Bot with AI Integration
 * Sprint 1: AI-powered conversations with memory
 * 
 * This version calls the main server's AI handler via HTTP API
 */

const TelegramBot = require('node-telegram-bot-api');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 DaVinci Dynamics AI Bot is running...');
console.log(`📡 Connected to server: ${SERVER_URL}`);

/**
 * Call server AI handler
 */
async function getAIResponse(telegramUser, message) {
  try {
    const response = await fetch(`${SERVER_URL}/api/trpc/bot.chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramUser: {
          id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
        },
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.data || 'Sorry, I encountered an error. Please try again.';
  } catch (error) {
    console.error('AI API Error:', error);
    return getFallbackResponse(message);
  }
}

/**
 * Fallback response if AI fails
 */
function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return `Our pricing starts at $2,500 setup + $500/month for the Starter package. This saves you 60-80% compared to traditional platforms! Would you like to see a detailed comparison?`;
  }

  if (lowerMsg.includes('demo') || lowerMsg.includes('video')) {
    return `I'd love to show you our platform! We have demos available and you can book a personalized walkthrough. Which would you prefer?`;
  }

  return `Thanks for your message! I can help you with pricing, demos, and booking consultations. What would you like to know?`;
}

// Handle /start command
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match[1].trim();
  
  console.log(`📨 /start from ${msg.from.username || msg.from.id} - param: "${startParam}"`);
  
  let response = '';
  let keyboard = null;
  
  if (startParam === 'site_chat') {
    response = `👋 *Welcome to DaVinci Dynamics!*

I'm your AI assistant, here to help you learn about our e-commerce platform that saves businesses 60-80% compared to Shopify and Square.

💬 Just ask me anything! I can help with:
• Pricing & packages
• Platform demos
• How it works
• Booking consultations

What would you like to know?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '🎥 Watch Demo', callback_data: 'demo' }
        ],
        [
          { text: '📞 Book Consultation', url: `${SERVER_URL}/booking` }
        ]
      ]
    };
    
  } else if (startParam === 'pricing') {
    response = `💰 *DaVinci Dynamics Pricing*

We offer three packages:

*🚀 Starter Launch*
• Setup: $2,500 | Monthly: $500
• Perfect for new online sellers

*📈 Growth System*
• Setup: $3,500-$5,000 | Monthly: $1,000-$1,500
• Ideal for growing businesses

*⚡ Scale Partner*
• Setup: $5,000+ | Monthly: $2,000+
• Enterprise solution

*Compare to traditional platforms:*
❌ Shopify + apps: $3,500-$8,000/month
✅ DaVinci: Save 60-80% every month!

Ask me anything about pricing!`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Demo', url: `${SERVER_URL}/booking` }
        ],
        [
          { text: '🎥 Watch Demo', callback_data: 'demo' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else if (startParam === 'watch_demo') {
    response = `🎥 *Platform Demo Videos*

Check out our e-commerce platform in action:

*📱 Mobile Demo*
See customer shopping experience
→ [View Mobile Demo](https://www.davincidynamics.site)

*💻 Desktop Demo*
Full platform with admin features
→ [View Desktop Demo](https://www.bosshookah.site)

*Key Features:*
✅ Custom branded storefront
✅ Shopping cart & checkout
✅ Automated notifications (SMS, Telegram, WhatsApp)
✅ Payment processing
✅ Admin dashboard

Want to see how this works for YOUR business?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Personal Demo', url: `${SERVER_URL}/booking` }
        ],
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else {
    response = `👋 *Welcome to DaVinci Dynamics!*

I'm your AI assistant! I can help you understand how we build custom e-commerce platforms that you OWN—saving you 60-80% vs Shopify/Square.

💬 Ask me anything or choose an option below:`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '🎥 Watch Demo', callback_data: 'demo' }
        ],
        [
          { text: '📞 Book Consultation', url: `${SERVER_URL}/booking` }
        ]
      ]
    };
  }
  
  bot.sendMessage(chatId, response, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: false
  });
});

// Handle callback queries from inline buttons
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  console.log(`🔘 Callback from ${query.from.username || query.from.id}: ${data}`);
  
  bot.answerCallbackQuery(query.id);
  
  let response = '';
  let keyboard = null;
  
  if (data === 'pricing') {
    response = `💰 *DaVinci Dynamics Pricing*

*🚀 Starter Launch*
• Setup: $2,500 | Monthly: $500

*📈 Growth System*
• Setup: $3,500-$5,000 | Monthly: $1,000-$1,500

*⚡ Scale Partner*
• Setup: $5,000+ | Monthly: $2,000+

Traditional platforms cost $3,500-$8,000/month.
✅ *You save 60-80% with us!*

Want specific savings for your business? Just ask!`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Demo', url: `${SERVER_URL}/booking` }
        ],
        [
          { text: '🎥 Watch Demo', callback_data: 'demo' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else if (data === 'demo') {
    response = `🎥 *Platform Demos*

*📱 Mobile:* [davincidynamics.site](https://www.davincidynamics.site)
*💻 Desktop:* [bosshookah.site](https://www.bosshookah.site)

Features: Custom storefront, checkout, automated notifications, admin dashboard, and more!

Want a personalized demo?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Personal Demo', url: `${SERVER_URL}/booking` }
        ],
        [
          { text: '💰 View Pricing', callback_data: 'pricing' }
        ]
      ]
    };
    
  } else if (data === 'chat') {
    response = `💬 *Ask Me Anything!*

I'm here to answer questions about:
• Platform features & capabilities
• Pricing & packages
• Migration from Shopify/Square
• Payment processing
• Bot automation
• And more!

Just type your question below! 👇`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Consultation', url: `${SERVER_URL}/booking` }
        ]
      ]
    };
  }
  
  bot.sendMessage(chatId, response, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: false
  });
});

// Handle all text messages with AI
bot.on('message', async (msg) => {
  // Skip commands and callback queries
  if (!msg.text || msg.text.startsWith('/')) {
    return;
  }
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  
  console.log(`💬 Message from ${msg.from.username || msg.from.id}: ${userMessage.substring(0, 50)}...`);
  
  try {
    // Show typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Get AI response from server
    const aiResponse = await getAIResponse(msg.from, userMessage);
    
    // Send response
    await bot.sendMessage(chatId, aiResponse, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    console.log(`✅ AI response sent to ${msg.from.username || msg.from.id}`);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    bot.sendMessage(chatId, "I'm having trouble right now. Please try again or book a call with our team!");
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Bot initialized successfully!');
console.log('💡 Tip: Set SERVER_URL environment variable if not using localhost:3000');
