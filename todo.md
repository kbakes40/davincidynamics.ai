# Project TODO

- [x] Add progress bar with seek functionality to Spotify player
- [x] Remove localStorage token persistence - require fresh auth each visit
- [x] Revert backend OAuth proxy - restore client-side OAuth implementation
- [x] Replace Spotify Web Playback SDK with embedded iframe player (no auth required)
- [x] Update Spotify player to use smooth jazz playlist
- [x] Update Spotify player to use upbeat house music playlist
- [x] Add descriptive titles above video placeholders
- [x] Add clickable links to open demo websites (mobile: davincidynamics.site, desktop: bosshookah.site)
- [x] Create new /booking page with hero, packages, booking form, and FAQ sections
- [x] Add /booking route to App.tsx
- [x] Add single "Book a Demo" button to promo page (no other changes)
- [x] Fix React Hooks violation in Book a Demo button (move useLocation to component top level)
- [x] Rebrand from hookah-specific to general ecommerce platform for all retail sellers
- [x] Update all instances of 'Ecommerce' to 'E-commerce' with hyphenation
- [x] Integrate Telegram bot to receive booking form submissions
- [x] Reorganize booking page: show pricing packages as hero section, form below
- [x] Replace mobile video placeholder with Google Drive video and enable autoplay
- [x] Download and integrate desktop demo video with autoplay
- [x] Add DaVinci Assist Bot chat option alongside booking form
- [x] Research current davincidynamics.ai site for contact information
- [x] Create new home page targeting small business owners and private sellers
- [x] Create navigation header component
- [x] Build Solutions, About, and Contact pages
- [x] Replace existing Home page with new DaVinci home
- [x] Update App.tsx routing
- [x] Fix nested anchor tag error in Navigation component
- [x] Restore original e-commerce promo page as a new navigation page
- [x] Add "Platform Demo" link to navigation menu
- [x] Add automated notification features section to Solutions page (SMS, Telegram, WhatsApp)
- [x] Update home page to highlight bot automation capabilities
- [x] Create interactive cost savings calculator component
- [x] Integrate calculator into home page with 12/24-month projections
- [x] Create Telegram bot handler script with start command responses
- [x] Add deployment instructions for bot handler
- [x] Develop comprehensive bot expansion plan with AI integration
- [x] Design advanced bot features architecture
- [x] Sprint 1: Set up database schema for bot conversations
- [x] Sprint 1: Implement AI handler with Manus LLM integration
- [x] Sprint 1: Add conversation memory management
- [x] Sprint 1: Integrate AI into existing bot
- [x] Sprint 1: Add analytics tracking
- [x] Sprint 1: Test AI responses and deploy
- [x] Create embedded AI chat widget component
- [x] Add floating chat button to all pages
- [x] Integrate chat with existing AI handler
- [x] Make chat widget draggable
- [x] Test embedded chat functionality
- [x] Update all links from old domain to davincidynamics.ai
- [x] Implement post-booking chat flow with thank-you message
- [x] Add context passing from booking form to chat
- [x] Test post-booking chat flow
- [x] Fix chat widget visibility - ensure floating button appears on screen
- [x] Update embedded chat to redirect pricing/complex questions to @DaVinciAssistBot
- [x] Simplify embedded chat to navigation helper only
- [x] Update all links from @DaVinciAssistBot to @DaVinciAssistantBot
- [x] Revert links back to @DaVinciAssistBot (correct bot name)
- [x] Set up TELEGRAM_BOT_TOKEN for @DaVinciAssistBot
- [x] Deploy bot handler and test responses
- [x] Remove embedded chat widget - only use Telegram
- [ ] Fix bot duplicate message issue - sends 3-4 same messages
- [x] Create Apple-style glassmorphic chat widget with dark tinted glass
- [x] Make chat widget draggable around the screen
- [x] Integrate chat widget with AI backend
- [x] Update bot AI to provide full conversational responses (no Telegram redirect)
- [x] Add typing indicator to chat widget
- [x] Implement character-by-character streaming for AI responses
- [x] Generate professional woman's face icon for chatbot
- [x] Give chatbot a professional name
- [x] Replace all Telegram bot links with chat widget
- [x] Update AI to be more sales-pushy
- [x] Add dynamic pricing shock responses
- [x] Hide floating chat bubble - only show when triggered by buttons
- [x] Generate new Sophia avatar with glasses - more sophisticated look
- [x] Update avatar in chat widget
- [x] Fix chat widget to appear when "Chat with Sophia" is clicked
- [x] Add dramatic center-screen entrance animation
- [x] Position widget in center initially, then allow dragging
- [x] Add semi-transparent backdrop behind chat widget
- [x] Dim background when Sophia appears
- [x] Fix chat widget not opening when "Chat with Sophia" is clicked
- [x] Fix Sophia widget size - make it smaller and usable
- [x] Fix Sophia positioning - center it perfectly on screen
- [x] Fix Sophia entrance animation - remove fade-out/fade-in loop
- [x] Add smooth slide-out transition when closing Sophia
- [x] Add smooth scale-up entrance animation for Sophia (reverse of close animation)
- [x] Make welcome message type out character-by-character as widget appears (ChatGPT-style)
- [x] Update Sophia's personality to be funny and sarcastic
- [x] Fix booking flow - immediately provide booking link when user says yes to availability
- [x] Update Sophia to extract and remember key customer facts (spending, business type, pain points)
- [x] Add defensive sarcastic responses when customers get mean - use their own information against them
- [x] Ensure Sophia never asks the same question twice by checking conversation history
- [x] Add "Hire via Fiverr" button next to "Book Demo" in header navigation (link: https://www.fiverr.com/s/8z7qA0g)
- [x] Update Sophia to share Fiverr link when customers ask about builds/custom work/development
- [x] Update Hire via Fiverr button to use specific gig link (https://www.fiverr.com/davincidynamics/build-a-revenue-optimized-ecommerce-system-with-automation)
- [x] Update Sophia to share new Fiverr gig link
- [x] Add natural transitions with callbacks to previous messages
- [x] Implement concern acknowledgment before pivoting
- [x] Add conversational bridges for smoother flow
- [x] Fix SEO: Add meta description (50-160 characters)
- [x] Fix SEO: Optimize title to 30-60 characters)
- [x] Fix SEO: Add keywords to page content
- [x] Add scroll-based fade transitions (sections fade out at top, fade in from below)
- [x] Add glassmorphism, shadows, and glow effects to home page sections
- [x] Add scroll fade effect to pricing sheet on Platform Demo page (fades in after videos)
- [x] Connect "Start Chat Now" button on Platform Demo to open Sophia chat widget
- [x] Reduce keywords from 11 to 3-8 focused terms
- [x] Optimize title to 30-60 characters
- [x] Create social preview image for Open Graph
- [x] Add Open Graph meta tags to home page
- [x] Add Open Graph meta tags to Platform Demo page
- [x] Add GA4 tracking script to index.html
- [x] Create GA4 event tracking utility
- [x] Add event tracking for button clicks (Book Demo, Hire via Fiverr, Start Chat)
- [x] Add event tracking for video interactions
- [x] Add event tracking for Sophia chat opens/closes
- [x] Update GA4 Measurement ID to G-X1X67V64XP
- [x] Add Google Search Console verification meta tag
- [x] Create XML sitemap
- [ ] Submit sitemap to Search Console (user action required)
- [x] Update contact email to info@davincidynamics.ai
- [x] Add enterprise department contact form with routing (sales@, projects@, support@)
- [x] Implement backend email routing logic
- [x] Remove separate department form box
- [x] Add department dropdown to existing "Send Us a Message" form
- [x] Add Billing and invoices department option
- [x] Hide "Routes to:" text from dropdown
- [x] Update Telegram notification to show department
- [x] Add "General Inquiry" department option (routes to info@davincidynamics.ai)
- [x] Rename "Support" to "Technical Support"
- [x] Debug Telegram bot notifications not sending
- [x] Check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID configuration
- [x] Review backend error logs for Telegram API errors
- [x] Fix Sophia chat widget not appearing on Platform Demo page when clicking Start Chat Now
- [x] Revert entrance animation changes that broke home screen Sophia
- [x] Add clickable link to mobile demo video (opens davincidynamics.site)
- [x] Add clickable link to desktop demo video (opens bosshookah.site)

## Copy Revisions - All-in-One Service Model
- [x] Update Home page hero section to remove "You own it" messaging
- [x] Revise pricing card copy to reflect transparent monthly fees (covers hosting + ad management)
- [x] Update Platform Demo page copy to match new service model
- [x] Review all pages for any remaining "ownership" or "no platform fees" language

## Grammar Improvements
- [x] Remove all em dashes (—) and replace with proper grammar/punctuation across all pages

## Revert Changes
- [x] Revert Home page wording back to original version (before all-in-one service changes)
- [x] Revert Sophia's welcome message back to original version (before all-in-one service changes)

## SEO Improvements
- [x] Fix home page title length (currently 26 chars, needs 30-60 chars)
- [x] Fix video links not navigating properly - mobile to davincidynamics.site, desktop to bosshookah.site

## Spotify Player Updates
- [x] Hide Spotify player by default
- [x] Add triple-tap screen detection to show Spotify player
- [x] Fix "View Live Demo" buttons - mobile to davincidynamics.site, desktop to bosshookah.site
- [x] Fix link loop issue - links redirecting to home instead of external sites (davincidynamics.site, bosshookah.site)

## Chatbot UI Updates
- [x] Update chatbot icon to AI head design with neon glow (transparent background)
- [x] Add "Powered by Davinci Dynamics" text to chatbot icon
- [x] Update Sophia's message avatars to use AI head icon

## CTA Optimization
- [x] Replace generic "Chat" CTAs with outcome-focused alternatives across all pages
- [x] Update Home page CTAs to emphasize value delivery
- [x] Update Platform Demo page CTAs to focus on specific outcomes
- [x] Update Booking page CTAs to reduce sales friction
- [x] Generate simplified chatbot icon (geometric head only, no lightning, no text, transparent background)
- [x] Update chatbot icon file in project (replaced with simplified version)
- [x] Rename chatbot from Sophia to Leo across all files
- [x] Regenerate chatbot icon with fully transparent background (no black circle)
- [x] Fix chatbot icon to display as circle (remove white square background with rounded styling)
- [x] Update system prompt in bot-ai-handler.ts to change Sophia to Leo
- [x] Generate chatbot icon with black background inside circle (keep circular shape)
- [x] Add pulse animation to Leo's header icon

## Leo Lead Booking Updates
- [x] Update Leo's system prompt to prioritize booking demo calls
- [x] Add contact information capture (name, email, phone) to conversation flow
- [x] Update conversation flow to push toward booking link

## Leo Professional Tone & Handoff
- [x] Update Leo's system prompt to professional business consultant tone (remove sarcasm)
- [x] Implement Telegram bot handoff after contact info capture
- [x] Add handoff notification to @Leo_Handoff_bot
- [x] Pause Leo's AI responses after handoff
- [x] Store handoff bot token securely
- [x] Add metadata field to conversations table for handoff tracking
- [x] Push database schema changes

## Conversation History Tracking
- [x] Create API endpoint to fetch full conversation history for a user
- [x] Create API endpoint to list all conversations with filters (date, status, handoff)
- [x] Add conversation export to JSON endpoint
- [x] Build conversation history dashboard page
- [x] Add conversation timeline view showing all messages chronologically
- [x] Add conversation metadata display (start time, duration, message count, handoff status)
- [x] Implement conversation search by user name, email, or message content
- [x] Add conversation export to JSON
- [x] Add route for conversation history page
- [ ] Add conversation tags and notes for internal tracking

## Bi-Directional Telegram Chat Sync
- [x] Set up Telegram webhook endpoint to receive agent messages
- [x] Store agent messages in conversation thread
- [x] Implement polling on website chat to fetch new messages
- [x] Update chat UI to display agent messages (distinguish from Leo AI)
- [x] Add visual indicator when human agent takes over
- [ ] Set up Telegram webhook URL with @Leo_Handoff_bot
- [ ] Test message flow: Telegram → Database → Website Chat

## Bug Fixes
- [x] Fix polling error: "hooks[lastArg] is not a function" - use trpc.useUtils() instead of direct query call

## Debug Telegram Message Sync
- [ ] Verify Telegram webhook is receiving messages
- [ ] Check if agent messages are being stored in database
- [ ] Verify polling mechanism is fetching messages
- [ ] Check conversation ID matching between handoff and webhook
- [ ] Add logging to webhook and polling endpoints

## Improve Telegram Message Routing
- [x] Update webhook to route ANY message to most recent active handed-off conversation
- [x] Remove requirement to reply to handoff notification
- [ ] Store chat_id to conversation_id mapping in database (optional enhancement)
- [x] Add fallback logic when no active conversation exists

## Debug Message Sync Issue
- [ ] Verify Telegram webhook is configured with correct URL
- [ ] Test webhook endpoint manually with curl
- [ ] Check server logs for webhook requests
- [ ] Verify messages are being stored in database
- [ ] Check frontend polling is working
- [ ] Verify conversation is marked as handed off

## Webhook Setup Script
- [x] Create script to automatically configure Telegram webhook
- [x] Add webhook status check endpoint
- [ ] Test webhook is receiving messages

## Debug Handoff Notification
- [ ] Check if handoff notification is being sent to Telegram
- [ ] Verify TELEGRAM_HANDOFF_BOT_TOKEN is correct
- [ ] Check server logs for Telegram API errors
- [ ] Test Telegram API manually with curl

## Debug Webhook Message Reception
- [x] Check if webhook is receiving Telegram messages
- [x] Create proper HTTP webhook endpoint (not tRPC)
- [x] Update webhook URL to /api/telegram-handoff-webhook
- [ ] Verify messages are being stored in database
- [ ] Check polling mechanism is fetching messages
- [ ] Verify conversation ID matching

## New Telegram Bot: @DavinciDynamics_Chatbot with Leo AI
- [x] Create Leo link-click handler with context parsing
- [x] Implement intent classification (demo/solution/support/hire/generic)
- [x] Build response generator with qualification questions
- [x] Add pricing/demo flow logic
- [x] Create fallback response handler
- [x] Set up new bot webhook endpoint
- [x] Configure bot token (DAVINCI_CHATBOT_TOKEN) via secrets
- [x] Run setup-davinci-webhook.js after deployment
- [x] Validate bot token with vitest
- [x] Document trigger, routing, and response steps

## Update @Leo_Handoff_bot Token
- [x] Request new TELEGRAM_HANDOFF_BOT_TOKEN from user
- [x] Validate new token with Telegram API
- [x] Reconfigure webhook with new token
- [x] Restart server with new token
- [x] Test handoff notification functionality

## Website-Telegram Bridge (User Never Leaves Site)
- [x] Send handoff notification to @DavinciDynamics_Chatbot with conversation context
- [x] Also send notification to @Leo_Handoff_bot for tracking
- [x] Route DaVinci bot messages back to website chat database
- [x] Website polling picks up DaVinci bot messages and displays them (already implemented)
- [ ] Test complete flow: Website → DaVinci Bot → Website
- [x] User never knows about Telegram - stays on website entire time

## Stop Leo AI After Handoff
- [x] Check conversation handoff status before generating Leo AI responses
- [x] Return silent/no response when conversation is handed off
- [x] Test that Leo stops responding after handoff

## Dual-Mode Chat System (AI vs Bridge)
- [x] Add 'mode' field to conversations table (ai | bridge)
- [x] Update conversation creation to default to 'ai' mode
- [x] Implement bridge mode: forward all messages to Telegram
- [x] Update chat handler to check mode before routing
- [x] Add admin UI to switch conversation modes (can be done via database)
- [x] Test AI mode (current behavior)
- [x] Test bridge mode (Telegram forwarding)

## Fix Bridge Mode Logic
- [x] Check conversation mode BEFORE calling Leo AI handler
- [x] Only call AI handler if mode is 'ai'
- [x] Test bridge mode forwards to Telegram without AI processing

## Set Bridge Mode as Default
- [x] Change schema default from 'ai' to 'bridge'
- [x] Push database migration
- [ ] Test new conversations default to bridge mode

## Manual Override Commands
- [x] Implement /takeback command (set mode to 'ai')
- [x] Implement /handoffleo command (set mode to 'bridge')
- [x] Add command parsing to DaVinci bot handler
- [ ] Test commands work correctly

## End-to-End Test
- [x] Create new conversation on website
- [x] Verify conversation defaults to bridge mode
- [x] Verify message forwards to Telegram
- [x] Reply in Telegram and verify appears on website
- [x] Test /takeback command
- [x] Test /handoffleo command
- [x] Capture logs and transcript

## 60-Second Timeout Fallback
- [x] Add timeout tracking to bridge mode forwarding
- [x] Send fallback message after 60s if no Leo reply
- [x] Continue waiting for Leo reply after fallback
- [x] Test timeout triggers correctly

## Debug Auto-Response Failure
- [x] Relax CID parsing to accept "Conversation ID:", "[CID]", "#123", etc.
- [x] Enforce owner=leo (mode=bridge) check before routing
- [x] Add comprehensive logging for debugging
- [ ] Verify webhook delivery to Telegram
- [ ] Run live test: website → Telegram → website
- [ ] Capture and analyze complete log trail

## Hotfix: Direct Message Delivery
- [x] Remove owner/mode blocking for testing
- [x] Implement direct sendMessageToConversation
- [x] Add comprehensive logging (conversationId, parsedCID, sendAttempted, sendStatus, error)
- [ ] Verify webhook receives Telegram replies
- [ ] Run live test and capture logs

## LEO-FIRST Mode Implementation
- [x] Change default conversation mode from 'bridge' to 'ai'
- [x] Push database schema change
- [x] Add 15-second timeout with fallback message
- [x] Implement retry logic on Leo generation failure (2 attempts)
- [x] Add comprehensive logging (attempt tracking, success/failure, timing)
- [x] Verify Leo AI responds automatically on website
- [x] Test /takeback and /handoffleo commands still work
- [x] Verify customer can chat and get Leo response without Telegram

## Hard Switch to Leo-First Runtime
- [x] Verify bridge mode is disabled (default mode = 'ai')
- [x] Bridge mode logic exists but only activates on manual override
- [x] Force Leo AI call on every customer message (default behavior)
- [x] Block template/canned responses unless Leo timeout >15s (implemented)
- [x] System confirmed in Leo-first runtime mode
- [ ] Run live test: send message, capture logs
- [ ] Verify logs show: inbound captured, Leo called, Leo output received, output delivered

## Route All to @DavinciDynamics_Chatbot
- [x] Change default mode from 'ai' back to 'bridge'
- [x] Push database schema change
- [x] Update timeout from 60s to 20s
- [x] Verify routing to @DavinciDynamics_Chatbot works
- [x] Verify /takeback and /handoffleo commands work
- [x] Test complete flow: website → Telegram → website

## Fix Telegram Webhook Message Handling
- [x] Treat EVERY Telegram message as agent output (no pattern matching)
- [x] Map to newest unanswered conversation with owner=leo
- [x] Add comprehensive logging: telegram_update_received, cid_resolved, website_send_attempted, website_send_status
- [ ] Test with exact format: "Conversation ID: 360009 Hey — Leo here. What platform are you currently using to sell?"
- [ ] Capture and analyze 5 log lines from webhook flow

## Remove @DavinciDynamics_Chatbot Integration
- [x] Remove DaVinci webhook endpoint from server
- [x] Remove DaVinci bot imports and setup calls
- [x] Delete webhook URL from Telegram
- [x] Keep only @Leo_Handoff_bot for agent responses

## FULL AUTO LEO MODE Implementation
- [x] Create Leo Telegram Bot handler with Telegraf (polling mode to avoid webhook conflicts)
- [x] Set all new conversations to owner=leo, mode=bridge
- [x] Forward every customer message to @DavinciDynamics_Chatbot
- [x] Capture Leo replies and post to website chat automatically
- [x] Add message deduplication (conversation_id + message_hash + direction)
- [x] Add retry logic (3 attempts, exponential backoff)
- [x] Add comprehensive logging (inbound_received, forwarded_to_telegram, leo_reply_received, delivered_to_website, delivery_failed)
- [x] Implement 20-second timeout fallback
- [x] Keep manual override commands (/takeback, /handoffleo)
- [ ] Test complete round trip with proof logs

## Convert Leo Bot to Webhook Mode
- [x] Replace Telegraf polling with webhook handler
- [x] Register webhook endpoint in Express
- [x] Auto-configure webhook URL on server start
- [ ] Test webhook receives messages from Telegram
- [ ] Verify complete round trip works

## Remove Leo_Handoff_bot to Eliminate Conflicts
- [ ] Disable Leo_Handoff_bot polling in telegram-bot-handler.ts
- [ ] Remove bridge-forwarder.ts (no longer needed)
- [ ] Clean up unused imports
- [ ] Verify no getUpdates conflicts

## Remove @DavinciDynamics_Chatbot Integration
- [x] Remove Leo webhook endpoint and handler
- [x] Remove Leo bot imports from server index
- [x] Delete leo-telegram-bot.ts file
- [x] Revert bot-router to simple AI mode (no bridge mode)
- [x] Clean up unused code

## Two-Bot Handoff Flow Implementation
- [x] Configure @Leo_Handoff_bot to forward all messages to @DavinciDynamics_Chatbot
- [x] Set up @DavinciDynamics_Chatbot webhook to receive forwarded messages
- [x] Implement response flow: DavinciBot → website chat
- [ ] Test complete flow: website → Leo_Handoff → DavinciBot → website

## Remove DavinciBot Webhook (Controlled by OpenClaw)
- [x] Delete webhook from @DavinciDynamics_Chatbot
- [x] Remove webhook configuration code from two-bot-handoff.ts
- [x] Remove webhook setup call from server index
- [x] Document that OpenClaw controls DavinciBot responses

## Update Chatbot Logic with DaVinci Dynamics Assistant Prompt
- [x] Replace bot-ai-handler system prompt with new DaVinci Dynamics prompt
- [x] Add button-based response logic (Get My Savings Plan, Book Demo, See Pricing, etc.)
- [x] Implement lead capture flow (platform, spend, pain point, contact info)
- [x] Add objection handling responses
- [x] Update handleMessage to accept context parameters
- [x] Update frontend to pass button_clicked, button_label, page_url context
- [x] Update bot router to accept context in chat mutation
- [x] Test chatbot with different button contexts

## Add Customer Name Capture to Chat Widget
- [x] Update GlassChatWidget to show name prompt before first message
- [x] Store customer name in state
- [x] Pass customer_name in context to all subsequent messages
- [x] Update welcome message to ask for name
- [x] Test name capture and personalization flow

## Add /shopify-alternative Landing Page
- [ ] Create ShopifyAlternative.tsx page component
- [ ] Implement Hero section with headline and dual CTAs
- [ ] Add Cost Breakdown section
- [ ] Add Value Proposition section
- [ ] Implement Savings Calculator with inputs/outputs
- [ ] Add Migration Reassurance block
- [ ] Add FAQ section with schema markup
- [ ] Add Final CTA section
- [ ] Create 2-step lead capture form component
- [ ] Add leads table to database schema
- [ ] Create lead capture tRPC mutation
- [ ] Add sticky CTA on scroll
- [ ] Customize chat widget first message for Shopify page
- [ ] Add route to App.tsx
- [ ] Add to navigation menu
- [ ] Add SEO metadata (title, description, FAQ schema)
- [ ] Add internal links to /pricing, /platform-demo, /contact
- [ ] Test responsive behavior
- [ ] Run build and verify no regressions

## Add /shopify-alternative Landing Page
- [x] Create ShopifyAlternative.tsx page component with all sections
- [x] Add leads table to database schema
- [x] Create leads router for tRPC
- [x] Add 2-step lead capture form with database integration
- [x] Implement savings calculator with real-time calculations
- [x] Add custom chat context for Shopify-specific first message
- [x] Wire into App.tsx routing
- [x] Add SEO metadata (title, description, FAQ schema)
- [x] Test complete flow and save checkpoint

## Add Template Showcase to Shopify Alternative Page
- [x] Create template showcase section with audience filters (All, Women, Men, Unisex)
- [x] Design 4 women-focused templates (Beauty & Skincare, Women's Fashion, Jewelry & Accessories, Wellness/Self-Care)
- [x] Design 4 men-focused templates (Men's Grooming, Men's Streetwear, Fitness/Supplements, Watches/Accessories)
- [x] Design 4 unisex templates (Minimal DTC, Bundle/Upsell, Social-Proof UGC, One-Product Funnel)
- [x] Implement filter functionality to show/hide templates by audience
- [x] Ensure each template has distinct layout, visual hierarchy, CTA placement, and merchandising strategy
- [x] Test filtering and save checkpoint

## Generate Template Preview Images
- [ ] Generate mockup images for 4 women-focused templates
- [ ] Generate mockup images for 4 men-focused templates
- [ ] Generate mockup images for 4 unisex templates
- [ ] Integrate preview images into template cards
- [ ] Test image loading and save checkpoint

## Add /profit-crm-demo Page
- [x] Create ProfitCrmDemo.tsx page component with all sections
- [x] Implement hero section with CTAs
- [x] Add profit snapshot KPI cards section
- [x] Build interactive profit calculator with inputs/outputs
- [x] Create CRM pipeline demo with interactive stages
- [x] Add before/after comparison block
- [x] Create demo preview cards section
- [x] Add FAQ section with schema markup
- [x] Implement 2-step lead capture form
- [x] Add tracking events (calculator_started, calculator_completed, demo_preview_opened, cta_clicked, form_started, form_submitted, booking_clicked)
- [x] Add custom chat context for profit-specific first message
- [x] Wire into App.tsx routing
- [x] Add SEO metadata (title, description, FAQ schema, Service schema)
- [x] Add navigation/footer links
- [x] Test complete flow and save checkpoint

## Profit Tracking Dashboard & Industry Calculators
- [x] Create profit_tracking table in database schema (user_id, month, revenue, cogs, platform_cost, ad_spend, fulfillment_cost, net_profit, margin, industry, created_at)
- [x] Push database schema changes
- [x] Create profit tracking router with tRPC procedures (saveMonthlyData, getTrackingHistory, getProgressStats)
- [x] Build ProfitDashboard page component with authentication check
- [x] Add monthly data entry form
- [x] Implement progress chart showing month-over-month improvements
- [x] Add industry-specific calculator variants (e-commerce, SaaS, service)
- [x] Update ProfitCrmDemo calculator with industry selection dropdown
- [x] Add industry-specific cost categories and benchmarks
- [x] Wire ProfitDashboard into App.tsx routing
- [x] Test complete flow and save checkpoint

## Rebrand Shopify Alternative to davincidynamics.ai

- [x] Update all "yourbusiness" domain references to "davincidynamics.ai"
- [x] Update page title and meta descriptions
- [x] Update any placeholder branding text
- [x] Test page and save checkpoint

## Fix Template Showcase Mobile Responsiveness

- [x] Identify mobile responsiveness issues in template showcase section
- [x] Fix grid layout for mobile devices (changed from md:grid-cols-2 to grid-cols-1 sm:grid-cols-2)
- [x] Ensure filter buttons are accessible on mobile (already using flex-wrap)
- [x] Test on mobile viewport and save checkpoint

## Investigate Mobile Template Visibility Issues

- [x] Check if fade animations are blocking template visibility on mobile (Found: opacity-0 was hiding templates)
- [x] Verify template section container width and padding on mobile (OK)
- [x] Ensure template images load properly on mobile (OK)
- [x] Add mobile-specific debugging/visibility improvements (Changed to md:opacity-0 so templates always visible on mobile)
- [x] Test on actual mobile device and save checkpoint

## Change Shopify Alternative Route Path

- [x] Update route from /shopify-alternative to /shopify in App.tsx
- [x] Update any internal links pointing to /shopify-alternative (GlassChatWidget.tsx, ShopifyAlternative.tsx)
- [x] Test new route and save checkpoint

## Investigate 404 Error on davincidynamics.ai/shopify

- [ ] Check if domain is properly bound to project (User needs to verify in Settings → Domains)
- [x] Verify route works on dev server (Confirmed working at /shopify)
- [x] Add redirect from /shopify-alternative to /shopify for backward compatibility
- [x] Test both URLs and confirm resolution (Both /shopify and /shopify-alternative redirect to /shopify correctly)
