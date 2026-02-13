import { describe, it, expect } from "vitest";

describe("Telegram Bot Credentials", () => {
  it("should have valid Telegram bot token and chat ID", async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    expect(TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(TELEGRAM_CHAT_ID).toBeDefined();

    // Test that we can reach the Telegram API with the token
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.result.username).toBeDefined();
  });

  it("should be able to send a test message", async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const testMessage = "✅ Telegram notification test - credentials are working!";

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: testMessage,
        }),
      }
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.ok).toBe(true);
  });
});
