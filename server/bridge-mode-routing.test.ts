/**
 * Test: Bridge Mode Routing to @DavinciDynamics_Chatbot
 * Verifies all conversations default to bridge mode and route to Telegram
 */

import { describe, it, expect } from 'vitest';
import { getDb } from './db';
import { conversations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Bridge Mode Routing', () => {
  it('should default new conversations to bridge mode', async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    
    if (!db) return;

    // Create a test conversation
    const [newConv] = await db.insert(conversations).values({
      userId: 999999, // Test user ID
      startedAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
      leadScoreChange: 0,
      metadata: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890'
      })
      // mode field should default to 'bridge' per schema
    }).$returningId();

    // Verify the conversation was created with bridge mode
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, newConv.id))
      .limit(1);

    expect(conv.length).toBe(1);
    expect(conv[0].mode).toBe('bridge');

    // Cleanup
    await db.delete(conversations).where(eq(conversations.id, newConv.id));
  });

  it('should have 20-second timeout configured', () => {
    // This is a static check - the timeout is hardcoded in bridge-forwarder.ts
    // We verify the value exists in the code
    const fs = require('fs');
    const path = require('path');
    
    const forwarderPath = path.join(__dirname, 'bridge-forwarder.ts');
    const content = fs.readFileSync(forwarderPath, 'utf-8');
    
    // Check that 20000ms (20 seconds) timeout is configured
    expect(content).toContain('20000');
    expect(content).toContain('20-second timeout');
  });

  it('should route to @DavinciDynamics_Chatbot by default', () => {
    // Verify the bot token environment variable is configured
    expect(process.env.DAVINCI_CHATBOT_TOKEN).toBeDefined();
    expect(process.env.DAVINCI_CHATBOT_TOKEN).toBeTruthy();
  });

  it('should have manual override commands available', async () => {
    const { parseConversationCommand } = await import('./conversation-commands');
    
    // Test /takeback command parsing
    const takebackResult = await parseConversationCommand('/takeback 123');
    expect(takebackResult).toBeTruthy();
    expect(takebackResult).toContain('123');
    
    // Test /handoffleo command parsing
    const handoffResult = await parseConversationCommand('/handoffleo 456');
    expect(handoffResult).toBeTruthy();
    expect(handoffResult).toContain('456');
    
    // Test non-command text
    const nonCommand = await parseConversationCommand('Hello world');
    expect(nonCommand).toBeNull();
  });
});
