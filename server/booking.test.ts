import { describe, it, expect } from "vitest";

describe("Telegram Integration", () => {
  it("should have valid Telegram credentials configured", async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    expect(TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(TELEGRAM_CHAT_ID).toBeDefined();
    expect(TELEGRAM_BOT_TOKEN).not.toBe("");
    expect(TELEGRAM_CHAT_ID).not.toBe("");

    // Test bot token validity by calling getMe endpoint
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.result).toHaveProperty("username");
  });
});
