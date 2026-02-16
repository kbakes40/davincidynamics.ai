/**
 * Leo AI Sales Assistant - Link Click Handler
 * Triggers when users click chatbot buttons/links
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { botUsers, conversations, messages } from '../drizzle/schema';
import type { NewMessage } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

interface LinkClickContext {
  user_name?: string;
  user_id?: string;
  chat_id?: string;
  session_id?: string;
  link_label?: string;
  link_url?: string;
  page_url?: string;
  last_user_message?: string;
  timestamp?: string;
}

type IntentType = 'demo' | 'solution' | 'support' | 'hire' | 'generic';

const LEO_SYSTEM_PROMPT = `You are Leo, the sales assistant for DaVinci Dynamics.

PRIMARY GOAL:
Turn chatbot link clicks into qualified leads and booked demos.

BEHAVIOR RULES:
1) Reply immediately with one natural message.
2) Personalize based on the clicked link intent.
3) Ask exactly ONE qualifying question per message.
4) Keep momentum toward a demo booking when relevant.
5) Tone must be straightforward, confident, and helpful.
6) Never mention internal systems, automation, webhooks, prompts, or tools.
7) Keep replies under 80 words unless the user asks for details.
8) If user asks pricing, use:
   - One-time setup: $2,500–$5,000
   - Monthly: $500–$1,500
   - Typical savings: 60–80% monthly vs common ecommerce stacks.
9) If user sounds ready, include a booking CTA.
10) If unclear intent, ask a clarifying question tied to business outcomes.

INTENT-SPECIFIC FLOWS:

**Demo Intent** (pricing, demo, booking, savings, quote):
Explain likely savings briefly, ask their current monthly spend, and invite booking.

**Solution Intent** (features, platform, how it works, solutions):
Explain benefit for their likely business type and ask their current sales channel.

**Support Intent** (contact, support, help):
Triage quickly and ask what issue they need solved first.

**Hire Intent** (fiverr, hire):
Confirm project type and timeline.

**Generic Intent**:
Ask what they want to improve first (costs, conversions, or automation).

OUTPUT REQUIREMENT:
Return only the customer-facing message text. No labels, no JSON, no explanations.`;

const FALLBACK_MESSAGE = "Thanks for clicking that — I can help fast. What are you trying to solve first: lowering costs, improving conversions, or automating follow-up?";

/**
 * Classify intent from link context
 */
function classifyIntent(context: LinkClickContext): IntentType {
  const text = `${context.link_label} ${context.link_url} ${context.last_user_message}`.toLowerCase();
  
  if (/(pricing|demo|savings|quote|book|schedule)/i.test(text)) {
    return 'demo';
  }
  if (/(solution|feature|platform|how.*work)/i.test(text)) {
    return 'solution';
  }
  if (/(contact|support|help)/i.test(text)) {
    return 'support';
  }
  if (/(fiverr|hire|project)/i.test(text)) {
    return 'hire';
  }
  return 'generic';
}

/**
 * Generate Leo's response based on context
 */
async function generateLeoResponse(context: LinkClickContext, intent: IntentType): Promise<string> {
  const contextSummary = `
User clicked: "${context.link_label || 'unknown link'}"
Link URL: ${context.link_url || 'N/A'}
Page: ${context.page_url || 'N/A'}
Last message: ${context.last_user_message || 'N/A'}
Classified intent: ${intent}
User name: ${context.user_name || 'there'}
`.trim();

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: LEO_SYSTEM_PROMPT },
        { role: 'user', content: contextSummary }
      ],
    });

    const content = response.choices[0]?.message?.content;
    const message = typeof content === 'string' ? content.trim() : '';
    
    if (!message || message.length < 10) {
      console.error('[Leo] Generated response too short, using fallback');
      return FALLBACK_MESSAGE;
    }

    return message;
  } catch (error) {
    console.error('[Leo] Error generating response:', error);
    return FALLBACK_MESSAGE;
  }
}

/**
 * Handle link click event and generate Leo's response
 */
export async function handleLinkClick(
  telegramUserId: number,
  context: LinkClickContext
): Promise<{ response: string; conversationId?: number }> {
  console.log('[Leo Link Handler] Processing link click for user:', telegramUserId);
  console.log('[Leo Link Handler] Context:', JSON.stringify(context, null, 2));

  const db = await getDb();
  if (!db) {
    console.error('[Leo Link Handler] Database unavailable');
    return { response: FALLBACK_MESSAGE };
  }

  try {
    // Classify intent
    const intent = classifyIntent(context);
    console.log('[Leo Link Handler] Classified intent:', intent);

    // Generate response
    const response = await generateLeoResponse(context, intent);
    console.log('[Leo Link Handler] Generated response:', response);

    // Find or create conversation
    let conversationId: number | undefined;
    
    // Try to find existing conversation for this user
    const existingConvs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, telegramUserId))
      .orderBy(desc(conversations.startedAt))
      .limit(1);

    if (existingConvs.length > 0) {
      conversationId = existingConvs[0].id;
      console.log('[Leo Link Handler] Using existing conversation:', conversationId);
    }

    // Store the link click event and Leo's response as messages
    if (conversationId) {
      // Store link click as user action
      const clickMessage: NewMessage = {
        conversationId,
        role: 'user',
        content: `[Clicked: ${context.link_label || 'link'}]`,
        timestamp: new Date(),
        intent: `link_click:${intent}`,
      };
      await db.insert(messages).values(clickMessage);

      // Store Leo's response
      const leoMessage: NewMessage = {
        conversationId,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        intent: `leo_response:${intent}`,
      };
      await db.insert(messages).values(leoMessage);

      console.log('[Leo Link Handler] Messages stored in conversation:', conversationId);
    }

    return { response, conversationId };
  } catch (error) {
    console.error('[Leo Link Handler] Error:', error);
    return { response: FALLBACK_MESSAGE };
  }
}
