/**
 * Test Telegram Bot Token Validity
 */

import { describe, it, expect } from 'vitest';

describe('Telegram Bot Configuration', () => {
  it('should have valid TELEGRAM_BOT_TOKEN', async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
    
    // Test token validity by calling Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result.username).toBe('DaVinciAssistBot');
  });
});
