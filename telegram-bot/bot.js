/**
 * DaVinci Dynamics Telegram Bot Handler
 * 
 * This bot responds to /start commands with different parameters:
 * - site_chat: General chat welcome
 * - pricing: Pricing information
 * - watch_demo: Demo video links
 */

const TelegramBot = require('node-telegram-bot-api');

// Load bot token from environment variable
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('DaVinci Dynamics Bot is running...');

// Handle /start command
bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match[1].trim();
  
  console.log(`Received /start command from ${chatId} with param: "${startParam}"`);
  
  // Determine response based on start parameter
  let response = '';
  let keyboard = null;
  
  if (startParam === 'site_chat') {
    // General chat from website
    response = `👋 *Welcome to DaVinci Dynamics!*

I'm here to help you learn about our e-commerce platform that saves you 60-80% compared to Shopify, Square, and other traditional platforms.

*What would you like to know?*

💰 Pricing & Packages
🎥 Platform Demo
🚀 How It Works
📞 Book a Consultation
💬 Ask a Question

Just type your question or choose from the options below!`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '🎥 Watch Demo', callback_data: 'demo' }
        ],
        [
          { text: '📞 Book Consultation', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ]
      ]
    };
    
  } else if (startParam === 'pricing') {
    // Pricing inquiry
    response = `💰 *DaVinci Dynamics Pricing*

We offer three packages to fit your business needs:

*🚀 Starter Launch*
• Setup: $2,500
• Monthly: $500
• Perfect for: New online sellers

*📈 Growth System*
• Setup: $3,500-$5,000
• Monthly: $1,000-$1,500
• Perfect for: Growing businesses

*⚡ Scale Partner*
• Setup: $5,000+
• Monthly: $2,000+
• Perfect for: Established retailers

*Compare this to:*
❌ Shopify: $79-$299/month + apps
❌ Square: 2.9% + 30¢ per transaction
❌ Email marketing: $50-$300/month
❌ Total: $3,500-$8,000/month

✅ *You save 60-80% every month!*

Ready to get started?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ],
        [
          { text: '🎥 Watch Platform Demo', callback_data: 'demo' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else if (startParam === 'watch_demo') {
    // Demo video request
    response = `🎥 *Platform Demo Videos*

Check out our e-commerce platform in action:

*📱 Mobile Demo*
See how customers browse and shop on mobile
→ [View Mobile Demo](https://www.davincidynamics.site)

*💻 Desktop Demo*
Full platform walkthrough with admin features
→ [View Desktop Demo](https://www.bosshookah.site)

*Key Features:*
✅ Custom branded storefront
✅ Shopping cart & checkout
✅ In-store pickup & shipping
✅ Payment processing (Zelle, cards)
✅ Customer accounts
✅ Admin dashboard
✅ Automated notifications (SMS, Telegram, WhatsApp)

Want to see how this works for YOUR business?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Personal Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ],
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else {
    // Default response (no parameter or unknown parameter)
    response = `👋 *Welcome to DaVinci Dynamics!*

We build custom e-commerce platforms that you OWN—no monthly platform fees eating your profits.

*Why Choose Us?*
💰 Save 60-80% vs Shopify/Square
🏪 Own your platform & customer data
🤖 Automated notifications (SMS, Telegram, WhatsApp)
📦 In-store pickup & shipping
💳 Lower payment processing fees

*What would you like to do?*`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '💰 View Pricing', callback_data: 'pricing' },
          { text: '🎥 Watch Demo', callback_data: 'demo' }
        ],
        [
          { text: '📞 Book Consultation', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ]
      ]
    };
  }
  
  // Send response with inline keyboard
  bot.sendMessage(chatId, response, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: false
  });
});

// Handle callback queries from inline keyboard buttons
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  console.log(`Received callback query: ${data} from ${chatId}`);
  
  // Answer the callback query to remove loading state
  bot.answerCallbackQuery(query.id);
  
  let response = '';
  let keyboard = null;
  
  if (data === 'pricing') {
    response = `💰 *DaVinci Dynamics Pricing*

We offer three packages to fit your business needs:

*🚀 Starter Launch*
• Setup: $2,500
• Monthly: $500
• Perfect for: New online sellers

*📈 Growth System*
• Setup: $3,500-$5,000
• Monthly: $1,000-$1,500
• Perfect for: Growing businesses

*⚡ Scale Partner*
• Setup: $5,000+
• Monthly: $2,000+
• Perfect for: Established retailers

*Compare this to:*
❌ Shopify: $79-$299/month + apps
❌ Square: 2.9% + 30¢ per transaction
❌ Total: $3,500-$8,000/month

✅ *You save 60-80% every month!*`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ],
        [
          { text: '🎥 Watch Demo', callback_data: 'demo' },
          { text: '💬 Ask Questions', callback_data: 'chat' }
        ]
      ]
    };
    
  } else if (data === 'demo') {
    response = `🎥 *Platform Demo Videos*

Check out our e-commerce platform in action:

*📱 Mobile Demo*
See how customers browse and shop on mobile
→ [View Mobile Demo](https://www.davincidynamics.site)

*💻 Desktop Demo*
Full platform walkthrough with admin features
→ [View Desktop Demo](https://www.bosshookah.site)

*Key Features:*
✅ Custom branded storefront
✅ Shopping cart & checkout
✅ In-store pickup & shipping
✅ Payment processing
✅ Automated notifications

Want to see how this works for YOUR business?`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Personal Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ],
        [
          { text: '💰 View Pricing', callback_data: 'pricing' }
        ]
      ]
    };
    
  } else if (data === 'chat') {
    response = `💬 *Ask Me Anything!*

I'm here to answer your questions about:

• Platform features & capabilities
• Pricing & packages
• Migration from Shopify/Square
• Payment processing options
• Shipping & pickup setup
• Customer data ownership
• Bot automation features

Just type your question and I'll help you out!

Or book a call with our team for a personalized walkthrough.`;
    
    keyboard = {
      inline_keyboard: [
        [
          { text: '📞 Book Consultation', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
        ]
      ]
    };
  }
  
  // Send response
  bot.sendMessage(chatId, response, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: false
  });
});

// Handle any text messages (for Q&A)
bot.on('message', (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  
  // Simple keyword-based responses
  if (!userMessage) return;
  
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
    bot.sendMessage(chatId, `💰 Our pricing starts at $2,500 setup + $500/month for the Starter package. This saves you 60-80% compared to traditional platforms!

Would you like to see the full pricing breakdown?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 View All Pricing', callback_data: 'pricing' },
            { text: '📞 Book Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
          ]
        ]
      }
    });
  } else if (lowerMsg.includes('demo') || lowerMsg.includes('video') || lowerMsg.includes('see')) {
    bot.sendMessage(chatId, `🎥 I can show you our platform demos! We have both mobile and desktop versions.

Would you like to watch them?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎥 Watch Demos', callback_data: 'demo' },
            { text: '📞 Book Live Demo', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
          ]
        ]
      }
    });
  } else if (lowerMsg.includes('book') || lowerMsg.includes('schedule') || lowerMsg.includes('call') || lowerMsg.includes('meeting')) {
    bot.sendMessage(chatId, `📞 Great! I can help you book a consultation with our team.

Click the button below to choose a time that works for you:`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📞 Book Consultation', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
          ]
        ]
      }
    });
  } else {
    // Generic helpful response
    bot.sendMessage(chatId, `Thanks for your message! 👋

I can help you with:
• 💰 Pricing information
• 🎥 Platform demos
• 📞 Booking a consultation
• 💬 General questions

What would you like to know more about?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 Pricing', callback_data: 'pricing' },
            { text: '🎥 Demo', callback_data: 'demo' }
          ],
          [
            { text: '📞 Book Call', url: 'https://3000-ivffr5j7qq1mb9nvb9hdg-c6ade6a9.us2.manus.computer/booking' }
          ]
        ]
      }
    });
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nStopping bot...');
  bot.stopPolling();
  process.exit(0);
});
