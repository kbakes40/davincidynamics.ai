/**
 * Vinci (@VinciDynamicsBot) — Telegram /start deep-link routing (first message only).
 */

export type VinciStartSource =
  | "unknown"
  | "home"
  | "pricing"
  | "demo"
  | "solutions"
  | "about"
  | "contact"
  | "ads"
  | "audit";

export type VinciNextStep = "business_type" | "demo_interest";

export interface VinciStartRoutingResult {
  reply: string;
  source: VinciStartSource;
  nextStep: VinciNextStep;
}

const ALLOWED = new Set([
  "home",
  "pricing",
  "demo",
  "solutions",
  "about",
  "contact",
  "ads",
  "audit",
]);

const BUSINESS_TYPE_WELCOME = `Welcome to DaVinci Dynamics.

We build revenue systems that help businesses capture better leads, follow up faster, and convert more customers.

This is quick.

What kind of business are you running right now?`;

const GENERIC_START: VinciStartRoutingResult = {
  source: "unknown",
  nextStep: "business_type",
  reply: BUSINESS_TYPE_WELCOME,
};

/**
 * Returns raw payload: "" for /start only, or token for /start token; null if not a /start message.
 * Handles Telegram’s /start@BotUsername and /start@BotUsername payload forms (case-insensitive).
 */
export function parseTelegramStart(text: string): string | null {
  const t = text.trim();
  const m = t.match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+(\S+))?\s*$/i);
  if (!m) return null;
  return (m[1] ?? "").trim().toLowerCase();
}

/** If message is /start, return routing + reply; otherwise null. */
export function resolveStartCommand(userMessage: string): VinciStartRoutingResult | null {
  const payload = parseTelegramStart(userMessage);
  if (payload === null) return null;

  if (payload === "" || !ALLOWED.has(payload)) {
    return { ...GENERIC_START };
  }

  const named: Record<
    string,
    Omit<VinciStartRoutingResult, "source"> & { source: VinciStartSource }
  > = {
    home: {
      source: "home",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    pricing: {
      source: "pricing",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    demo: {
      source: "demo",
      nextStep: "demo_interest",
      reply: `Good — you just walked through the demo.

What stood out most: lead flow, automation, conversion, or the overall system?`,
    },
    solutions: {
      source: "solutions",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    about: {
      source: "about",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    contact: {
      source: "contact",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    ads: {
      source: "ads",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
    audit: {
      source: "audit",
      nextStep: "business_type",
      reply: BUSINESS_TYPE_WELCOME,
    },
  };

  return named[payload]!;
}
