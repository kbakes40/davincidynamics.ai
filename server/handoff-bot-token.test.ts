/**
 * Test Leo Handoff Bot Token Validation
 */

import { describe, it, expect } from 'vitest';

describe('Leo Handoff Bot Token', () => {
  it('should have valid bot token configured', async () => {
    const token = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
    
    expect(token).toBeDefined();
    expect(token).not.toBe('');
    
    // Validate token format (should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
  });

  it('should be able to call Telegram Bot API with token', async () => {
    const token = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
    
    if (!token) {
      throw new Error('TELEGRAM_HANDOFF_BOT_TOKEN not configured');
    }

    // Call getMe endpoint to verify token
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result.is_bot).toBe(true);
    
    console.log('✅ Handoff bot verified:', data.result.username);
    console.log('   Bot ID:', data.result.id);
    console.log('   First name:', data.result.first_name);
  });
});
