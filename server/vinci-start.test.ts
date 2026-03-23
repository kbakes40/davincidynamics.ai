import { describe, it, expect } from "vitest";
import { parseTelegramStart } from "./vinci-start";

describe("parseTelegramStart", () => {
  it("parses bare /start", () => {
    expect(parseTelegramStart("/start")).toBe("");
    expect(parseTelegramStart("  /start  ")).toBe("");
  });

  it("parses /start with payload", () => {
    expect(parseTelegramStart("/start pricing")).toBe("pricing");
    expect(parseTelegramStart("/start  demo")).toBe("demo");
  });

  it("parses Telegram /start@BotUsername form", () => {
    expect(parseTelegramStart("/start@VinciDynamicsBot")).toBe("");
    expect(parseTelegramStart("/start@VinciDynamicsBot pricing")).toBe("pricing");
    expect(parseTelegramStart("/START@SomeBot_123 audit")).toBe("audit");
  });

  it("returns null for non-start messages", () => {
    expect(parseTelegramStart("hello")).toBeNull();
    expect(parseTelegramStart("/help")).toBeNull();
    expect(parseTelegramStart("/startover")).toBeNull();
  });
});
