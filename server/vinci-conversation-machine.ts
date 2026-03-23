/**
 * Vinci (@VinciDynamicsBot) — deterministic qualification state machine.
 * Telegram /start + deep links + step-by-step capture; no slash-command menus in copy.
 */

import { parseTelegramStart } from "./vinci-start";
import type { VinciStartSource } from "./vinci-start";

const ALLOWED_PAYLOAD = new Set([
  "home",
  "pricing",
  "demo",
  "solutions",
  "about",
  "contact",
  "ads",
  "audit",
]);

export type VinciConversationState =
  | "idle"
  | "awaiting_business_type"
  | "awaiting_demo_interest"
  | "awaiting_main_problem"
  | "awaiting_current_setup"
  | "awaiting_urgency"
  | "awaiting_contact_preference"
  | "awaiting_phone"
  | "awaiting_email"
  | "offered_booking"
  | "completed";

export type VinciPersisted = {
  conversation_state: VinciConversationState;
  source: VinciStartSource;
  business_type?: string;
  main_problem?: string;
  current_setup?: string;
  urgency?: string;
  lead_score?: "hot" | "warm" | "cold";
  contact_preference?: string;
  phone?: string;
  email?: string;
  demo_interest?: string;
  startWelcomeHandled?: boolean;
  /** ms for dedupe */
  lastStartAtMs?: number;
  welcomeSentAtMs?: number;
  /** User text blobs for scoring */
  userAnswersBlob?: string;
};

const RAPID_START_MS = 4500;

const WELCOME_DEFAULT = `Welcome to DaVinci Dynamics.

I'm Vinci. I help businesses figure out what is slowing growth and what to fix first.

This is quick.

What kind of business are you running right now?`;

const WELCOME_PRICING = `Welcome to DaVinci Dynamics.

I'm Vinci. Most builds are customized around the business, so the fastest way to point you in the right direction is to understand what you need first.

What kind of business are you running right now?`;

const WELCOME_DEMO = `Welcome to DaVinci Dynamics.

I'm Vinci. I saw you came from the demo.

What stood out most to you, lead flow, automation, conversion, or the overall system?`;

const WELCOME_AUDIT = `Welcome to DaVinci Dynamics.

I'm Vinci. Let's figure out where the bottleneck is.

What kind of business are you running right now?`;

const MAIN_PROBLEM_Q = `Got it.

What are you trying to improve most right now, leads, follow up, conversion, automation, or website performance?`;

const URGENCY_Q =
  "Are you looking to move on this soon, or are you just exploring options right now?";

const CONTACT_PREF_Q =
  "What's the best way to reach you if we map this out, phone or email?";

const PHONE_Q = "What's the best number to reach you at?";

const EMAIL_Q = "What's the best email to reach you at?";

export const VINCI_CLOSING_MESSAGE = `Perfect.

I've got what I need.

We'll follow up with you shortly. ⚙️`;

export function resolveStartSource(userMessage: string): VinciStartSource | null {
  const p = parseTelegramStart(userMessage);
  if (p === null) return null;
  if (p === "" || !ALLOWED_PAYLOAD.has(p)) return "unknown";
  return p as VinciStartSource;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function appendBlob(vs: VinciPersisted, line: string): Partial<VinciPersisted> {
  const prev = vs.userAnswersBlob || "";
  return { userAnswersBlob: `${prev}\n${line}`.slice(-4000) };
}

function parseBusinessType(text: string): string {
  const t = normalize(text);
  if (t.includes("telecom")) return "telecom";
  if (t.includes("ecommerce") || t.includes("e-commerce") || t.includes("shopify"))
    return "ecommerce";
  if (t.includes("agency")) return "agency";
  if (t.includes("local")) return "local_business";
  if (t.includes("service")) return "service_business";
  if (t.includes("small") || t.includes("business")) return "small_business";
  return "other";
}

function parseMainProblem(text: string): string {
  const t = normalize(text);
  if (t.includes("website") || t.includes("site ") || t.endsWith("site"))
    return "website_performance";
  if (t.includes("lead") || t.includes("traffic")) return "leads";
  if (t.includes("follow")) return "follow_up";
  if (t.includes("convert")) return "conversion";
  if (t.includes("automat")) return "automation";
  return "other";
}

function parseCurrentSetup(text: string): string {
  const t = normalize(text);
  if (t.includes("fresh") || t.includes("starting") || t.includes("scratch"))
    return "starting_fresh";
  if (t.includes("partial") || t.includes("some")) return "partial_setup";
  if (t.includes("system") && !t.includes("no ")) return "has_system";
  if (t.includes("website") || t.includes("site")) return "has_website";
  return "unknown";
}

function parseUrgency(text: string): string {
  const t = normalize(text);
  if (t.includes("explor") || t.includes("just look") || t.includes("brows"))
    return "exploring";
  if (t.includes("soon") || t.includes("next week") || t.includes("month"))
    return "soon";
  if (
    t.includes("now") ||
    t.includes("asap") ||
    t.includes("ready") ||
    t.includes("urgent") ||
    t.includes("this week")
  )
    return "ready_now";
  return "unknown";
}

function scoreLead(vs: VinciPersisted): "hot" | "warm" | "cold" {
  const blob = normalize(vs.userAnswersBlob || "");
  const hotSignals =
    /price|cost|how much|timeline|book|call|ready now|asap|missed lead|dropped lead|no follow|weak follow|losing deal|ad spend|ads\b/i.test(
      blob
    );
  const urgent = vs.urgency === "ready_now" || vs.urgency === "soon";
  if (hotSignals || (urgent && vs.main_problem && vs.main_problem !== "other"))
    return "hot";
  const coldSignals =
    /just browsing|maybe later|not sure|thinking about it|no rush|far out/i.test(blob);
  if (coldSignals || vs.urgency === "exploring") return "cold";
  return "warm";
}

function setupBranchReply(mainProblem: string): { reply: string; note: string } {
  if (mainProblem === "website_performance") {
    return {
      reply: `That makes sense.

In most cases, the bigger issue is not just having a site, it is whether the system behind it actually converts traffic into customers.

Do you already have something in place, or are you starting fresh?`,
      note: "website path",
    };
  }
  if (mainProblem === "leads") {
    return {
      reply: `That is a common one.

A lot of businesses think they need more leads, when the real leak is usually conversion, follow up, or how opportunities are being handled after they come in.

Do you already have a system in place right now?`,
      note: "leads path",
    };
  }
  return {
    reply:
      "Do you already have a website or system in place, or are you starting fresh?",
    note: "generic setup",
  };
}

function parseContactPreference(text: string): "phone" | "email" | "both" | "unknown" {
  const t = normalize(text);
  const hasPhone = /\bphone\b|\bmobile\b|\btext\b|\bsms\b|\bcall\b/i.test(t);
  const hasEmail = /\bemail\b|\be-mail\b/i.test(t);
  if (hasPhone && hasEmail) return "both";
  if (hasPhone) return "phone";
  if (hasEmail) return "email";
  if (t.includes("either") || t.includes("both")) return "both";
  return "unknown";
}

export type VinciTurnResult = {
  reply: string;
  vinciPatch: Partial<VinciPersisted>;
  /** Merge into metadata.vinci */
  saveUserMessage: boolean;
  saveAssistantMessage: boolean;
  completeHandoff: boolean;
  /** When true, caller runs DB handoff + finalize conversation */
  lastUserMessageForHandoff: string;
};

function defaultVs(source: VinciStartSource): VinciPersisted {
  return {
    conversation_state: "idle",
    source,
  };
}

export function vinciStateFromMeta(v: Record<string, unknown> | undefined): VinciPersisted {
  if (!v || typeof v !== "object") {
    return defaultVs("unknown");
  }
  const state = (v.conversation_state as VinciConversationState) || "idle";
  const source = (v.source as VinciStartSource) || "unknown";
  return {
    conversation_state: state,
    source,
    business_type: v.business_type as string | undefined,
    main_problem: v.main_problem as string | undefined,
    current_setup: v.current_setup as string | undefined,
    urgency: v.urgency as string | undefined,
    lead_score: v.lead_score as VinciPersisted["lead_score"],
    contact_preference: v.contact_preference as string | undefined,
    phone: v.phone as string | undefined,
    email: v.email as string | undefined,
    demo_interest: v.demo_interest as string | undefined,
    startWelcomeHandled: v.startWelcomeHandled as boolean | undefined,
    lastStartAtMs: v.lastStartAtMs as number | undefined,
    welcomeSentAtMs: v.welcomeSentAtMs as number | undefined,
    userAnswersBlob: v.userAnswersBlob as string | undefined,
  };
}

function welcomeForSource(source: VinciStartSource): string {
  if (source === "pricing") return WELCOME_PRICING;
  if (source === "demo") return WELCOME_DEMO;
  if (source === "audit") return WELCOME_AUDIT;
  return WELCOME_DEFAULT;
}

function initialStateForSource(source: VinciStartSource): VinciConversationState {
  if (source === "demo") return "awaiting_demo_interest";
  return "awaiting_business_type";
}

/**
 * Single inbound user message → reply + metadata patch.
 */
export function processVinciTurn(
  userMessage: string,
  vsIn: VinciPersisted
): VinciTurnResult {
  const vs = { ...vsIn };
  const now = Date.now();
  const startSource = resolveStartSource(userMessage);

  /* -------- /start (any variant) -------- */
  if (startSource !== null) {
    const active =
      vs.conversation_state !== "idle" &&
      vs.conversation_state !== "completed" &&
      vs.welcomeSentAtMs != null;

    if (active) {
      if (now - (vs.lastStartAtMs || 0) < RAPID_START_MS) {
        return {
          reply:
            "We're already connected — just keep replying here with your answers.",
          vinciPatch: { lastStartAtMs: now },
          saveUserMessage: true,
          saveAssistantMessage: true,
          completeHandoff: false,
          lastUserMessageForHandoff: userMessage,
        };
      }
      return {
        reply:
          "Still in your thread — tell me your business type or the next detail whenever you're ready.",
        vinciPatch: { lastStartAtMs: now, source: startSource },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }

    const reply = welcomeForSource(startSource);
    const conversation_state = initialStateForSource(startSource);
    return {
      reply,
      vinciPatch: {
        source: startSource,
        conversation_state,
        lastStartAtMs: now,
        welcomeSentAtMs: now,
        startWelcomeHandled: true,
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- idle: nudge Start -------- */
  if (vs.conversation_state === "idle" || !vs.welcomeSentAtMs) {
    return {
      reply:
        "Tap Start below (or send /start) and I'll walk you through a quick few questions.",
      vinciPatch: {},
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  if (vs.conversation_state === "completed") {
    return {
      reply:
        "This thread is wrapped up. If you need anything else, open the menu and tap Start again for a fresh chat.",
      vinciPatch: {},
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  const blobPatch = appendBlob(vs, userMessage);

  /* -------- awaiting_demo_interest -------- */
  if (vs.conversation_state === "awaiting_demo_interest") {
    return {
      reply: "What kind of business are you running right now?",
      vinciPatch: {
        ...blobPatch,
        demo_interest: userMessage.slice(0, 800),
        conversation_state: "awaiting_business_type",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_business_type -------- */
  if (vs.conversation_state === "awaiting_business_type") {
    const business_type = parseBusinessType(userMessage);
    return {
      reply: MAIN_PROBLEM_Q,
      vinciPatch: {
        ...blobPatch,
        business_type,
        conversation_state: "awaiting_main_problem",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_main_problem -------- */
  if (vs.conversation_state === "awaiting_main_problem") {
    const main_problem = parseMainProblem(userMessage);
    const { reply } = setupBranchReply(main_problem);
    return {
      reply,
      vinciPatch: {
        ...blobPatch,
        main_problem,
        conversation_state: "awaiting_current_setup",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_current_setup -------- */
  if (vs.conversation_state === "awaiting_current_setup") {
    const current_setup = parseCurrentSetup(userMessage);
    return {
      reply: URGENCY_Q,
      vinciPatch: {
        ...blobPatch,
        current_setup,
        conversation_state: "awaiting_urgency",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_urgency -------- */
  if (vs.conversation_state === "awaiting_urgency") {
    const urgency = parseUrgency(userMessage);
    const nextVs = {
      ...vs,
      ...blobPatch,
      urgency,
      userAnswersBlob: `${vs.userAnswersBlob || ""}\n${userMessage}`.slice(-4000),
    };
    const lead_score = scoreLead(nextVs);
    return {
      reply: CONTACT_PREF_Q,
      vinciPatch: {
        ...blobPatch,
        urgency,
        lead_score,
        conversation_state: "awaiting_contact_preference",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_contact_preference -------- */
  if (vs.conversation_state === "awaiting_contact_preference") {
    const pref = parseContactPreference(userMessage);
    if (pref === "email") {
      return {
        reply: EMAIL_Q,
        vinciPatch: {
          ...blobPatch,
          contact_preference: "email",
          conversation_state: "awaiting_email",
        },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }
    return {
      reply: PHONE_Q,
      vinciPatch: {
        ...blobPatch,
        contact_preference: pref === "unknown" ? "phone" : pref,
        conversation_state: "awaiting_phone",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_phone -------- */
  if (vs.conversation_state === "awaiting_phone") {
    const phone = userMessage.replace(/\s+/g, " ").trim().slice(0, 40);
    return {
      reply: EMAIL_Q,
      vinciPatch: {
        ...blobPatch,
        phone,
        conversation_state: "awaiting_email",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* -------- awaiting_email -------- */
  if (vs.conversation_state === "awaiting_email") {
    const emailMatch = userMessage.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
    );
    const email = emailMatch
      ? emailMatch[0]
      : userMessage.replace(/\s+/g, " ").trim().slice(0, 120);

    return {
      reply: VINCI_CLOSING_MESSAGE,
      vinciPatch: {
        ...blobPatch,
        email,
        conversation_state: "completed",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: true,
      lastUserMessageForHandoff: userMessage,
    };
  }

  /* offered_booking / fallback */
  return {
    reply:
      "Thanks — tell me a bit more about your business or what you want to improve, and we'll go from there.",
    vinciPatch: { ...blobPatch },
    saveUserMessage: true,
    saveAssistantMessage: true,
    completeHandoff: false,
    lastUserMessageForHandoff: userMessage,
  };
}
