/**
 * Vinci (@VinciDynamicsBot) — lead capture specialist for DaVinci Dynamics.
 * Qualification, objections, closing, contact capture; no slash-command prompts in copy.
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
  | "awaiting_closing_intent"
  | "awaiting_contact_preference"
  | "awaiting_phone"
  | "awaiting_email"
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
  lastStartAtMs?: number;
  welcomeSentAtMs?: number;
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

What are you trying to improve most right now, leads, follow up, conversion, automation, or overall performance?`;

const URGENCY_Q =
  "Are you looking to move on this soon, or just exploring options right now?";

const CONTACT_PREF_Q = `Let's make this easy.

What's the best way to reach you, phone or email?`;

const PHONE_Q = "What's the best number to reach you at?";

const EMAIL_Q = "What's the best email to reach you at?";

export const VINCI_CLOSING_MESSAGE = `Perfect.

I've got what I need.

We'll follow up with you shortly. ⚙️`;

const CLOSE_HOT = `Based on what you shared, there's probably a real opportunity to tighten up the system and improve how things are converting.

Next step would be to map it out properly so you can see exactly what needs to be fixed and how.

Would you want me to set that up?`;

const CLOSE_WARM = `That makes sense.

From what you're describing, there are definitely a few areas that could be tightened up to improve consistency and results.

We can map that out so you have a clear path forward.

Would that be helpful?`;

const CLOSE_COLD = `No problem.

At the very least, I can point you in the right direction so you know what is worth fixing first.

What has been the biggest challenge so far?`;

const SOFT_TO_CONTACT = `Understood.

Let's make this easy.

What's the best way to reach you, phone or email?`;

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
  if (t.includes("performance") && !t.includes("website")) return "other";
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
    /price|cost|how much|timeline|book|call|ready now|asap|missed|dropped lead|no follow|weak follow|poor follow|losing deal|ad spend|move on|this week|urgent/i.test(
      blob
    );
  const urgent = vs.urgency === "ready_now" || vs.urgency === "soon";
  const clearPain =
    vs.main_problem &&
    vs.main_problem !== "other" &&
    (vs.business_type !== undefined || blob.length > 40);
  if (hotSignals || (urgent && clearPain) || (urgent && vs.main_problem && vs.main_problem !== "other"))
    return "hot";
  const coldSignals =
    /just browsing|maybe later|not sure|thinking about it|no rush|far out|only looking|just looking/i.test(
      blob
    );
  if (coldSignals || vs.urgency === "exploring") return "cold";
  return "warm";
}

function setupBranchReply(mainProblem: string): { reply: string } {
  if (mainProblem === "website_performance") {
    return {
      reply: `That makes sense.

In most cases, the bigger issue is not just having a site, it is whether the system behind it actually converts traffic into customers.

Do you already have something in place, or are you starting fresh?`,
    };
  }
  if (mainProblem === "leads") {
    return {
      reply: `That is a common one.

A lot of businesses think they need more leads, but the real issue is usually conversion, follow up, or how opportunities are being handled.

Do you already have a system in place right now?`,
    };
  }
  return {
    reply:
      "Do you already have a website or system in place, or are you starting fresh?",
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

function parseAffirmative(t: string): boolean {
  const n = normalize(t);
  if (n.length < 2) return false;
  return (
    /^(yes|yeah|yep|sure|ok|okay|please|definitely|absolutely|sounds good|let's do|lets do|do it|go ahead)/i.test(
      n
    ) ||
    /\b(yes|yeah|sure)\b/i.test(n)
  );
}

function parseNegative(t: string): boolean {
  const n = normalize(t);
  return /^(no|nope|nah|not now|not really|not yet)\b/i.test(n) || /\bno thanks\b/i.test(n);
}

function closingMessageForTier(tier: "hot" | "warm" | "cold"): string {
  if (tier === "hot") return CLOSE_HOT;
  if (tier === "warm") return CLOSE_WARM;
  return CLOSE_COLD;
}

/** Short, calm objection replies; no command prompts. */
function tryObjectionResponse(raw: string, vs: VinciPersisted): string | null {
  const t = normalize(raw);
  if (t.length < 2) return null;

  if (vs.conversation_state === "awaiting_email" && /@/.test(raw)) return null;

  if (
    /\b(too )?expensive\b|\btoo much\b.*\b(money|cost)\b|\b(can't|cannot) afford\b/i.test(raw) ||
    (t.includes("expensive") && t.length < 100)
  ) {
    return `That's fair.

Most businesses end up losing more from missed opportunities, weak conversion, or slow follow up than they would fixing the system.

We can keep this simple and just map out where things are leaking first.

Would that be helpful?`;
  }

  if (
    /\bnot ready\b|\bnot ready yet\b|\btoo early\b/i.test(t) ||
    (t.includes("not ready") && t.length < 120)
  ) {
    return `That makes sense.

This is usually the best time to fix the foundation before more time or money goes into something that is not converting well.

What part feels the most inconsistent right now?`;
  }

  if (
    /\bjust (looking|browsing)\b|\bonly (looking|browsing)\b|\bwindow shopping\b/i.test(t) ||
    (t.includes("just looking") && t.length < 100)
  ) {
    return `No problem.

I can still point you in the right direction so you know what is actually worth fixing first.

What has been the biggest challenge so far?`;
  }

  if (
    /\balready have (a )?website\b|\bhave a website\b|\bsite is live\b/i.test(t) ||
    (t.includes("already have") && t.includes("website"))
  ) {
    return `That's good.

In most cases, the issue is not having a site, it is whether the system behind it is actually converting and following up properly.

Do you feel like it is doing that consistently right now?`;
  }

  if (
    /\bjust need more leads\b|\bneed more leads\b|\bmore leads\b/i.test(t) &&
    !t.includes("follow")
  ) {
    return `That is a common one.

A lot of businesses think they need more leads, but the real issue is usually what happens after the lead comes in.

Are you seeing leads fall off after they reach out?`;
  }

  if (
    /\b(no|don't|do not) have time\b|\btoo busy\b|\bno time\b/i.test(t) ||
    (t.includes("time") && (t.includes("don't have") || t.includes("no time")))
  ) {
    return `I get that.

That is usually the exact problem we are solving, removing the manual work so the system handles it.

This will be quick.

What is taking up most of your time right now?`;
  }

  if (
    /\bhow much\b|\bpricing\b|\bprice\b|\bcost\b|\bquote\b|\bestimate\b/i.test(t) &&
    (t.length < 160 || /\b(price|pricing|cost|how much)\b/i.test(t))
  ) {
    return `I can point you in the right direction.

Most builds are customized around the business, so the fastest way to get accurate pricing is to understand what you actually need first.

What kind of business are you running?`;
  }

  return null;
}

function objectionAppliesToState(state: VinciConversationState): boolean {
  return (
    state !== "idle" &&
    state !== "completed" &&
    state !== "awaiting_demo_interest"
  );
}

function normalizeConversationState(
  s: string | undefined
): VinciConversationState {
  if (!s) return "idle";
  if (s === "offered_booking") return "awaiting_contact_preference";
  const allowed: VinciConversationState[] = [
    "idle",
    "awaiting_business_type",
    "awaiting_demo_interest",
    "awaiting_main_problem",
    "awaiting_current_setup",
    "awaiting_urgency",
    "awaiting_closing_intent",
    "awaiting_contact_preference",
    "awaiting_phone",
    "awaiting_email",
    "completed",
  ];
  return (allowed.includes(s as VinciConversationState) ? s : "idle") as VinciConversationState;
}

export type VinciTurnResult = {
  reply: string;
  vinciPatch: Partial<VinciPersisted>;
  saveUserMessage: boolean;
  saveAssistantMessage: boolean;
  completeHandoff: boolean;
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
  const state = normalizeConversationState(v.conversation_state as string | undefined);
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

export function processVinciTurn(
  userMessage: string,
  vsIn: VinciPersisted
): VinciTurnResult {
  const vs = { ...vsIn };
  const now = Date.now();
  const startSource = resolveStartSource(userMessage);

  if (startSource !== null) {
    const active =
      vs.conversation_state !== "idle" &&
      vs.conversation_state !== "completed" &&
      vs.welcomeSentAtMs != null;

    if (active) {
      if (now - (vs.lastStartAtMs || 0) < RAPID_START_MS) {
        return {
          reply:
            "We are already in this conversation — reply here whenever you are ready.",
          vinciPatch: { lastStartAtMs: now },
          saveUserMessage: true,
          saveAssistantMessage: true,
          completeHandoff: false,
          lastUserMessageForHandoff: userMessage,
        };
      }
      return {
        reply:
          "Still with you. Pick up from the last question whenever it works for you.",
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

  if (vs.conversation_state === "idle" || !vs.welcomeSentAtMs) {
    return {
      reply:
        "When you are ready, tap Start below. I will keep this short and focused.",
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
        "This conversation is complete. You can open a new chat from the menu whenever you need us.",
      vinciPatch: {},
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  const blobPatch = appendBlob(vs, userMessage);

  if (objectionAppliesToState(vs.conversation_state)) {
    const objection = tryObjectionResponse(userMessage, vs);
    if (objection) {
      return {
        reply: objection,
        vinciPatch: { ...blobPatch },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }
  }

  if (vs.conversation_state === "awaiting_demo_interest") {
    const ob = tryObjectionResponse(userMessage, vs);
    if (ob) {
      return {
        reply: ob,
        vinciPatch: { ...blobPatch },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }
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

  if (vs.conversation_state === "awaiting_urgency") {
    const urgency = parseUrgency(userMessage);
    const nextVs = {
      ...vs,
      ...blobPatch,
      urgency,
      userAnswersBlob: `${vs.userAnswersBlob || ""}\n${userMessage}`.slice(-4000),
    };
    const lead_score = scoreLead(nextVs);
    const tier = lead_score;
    return {
      reply: closingMessageForTier(tier),
      vinciPatch: {
        ...blobPatch,
        urgency,
        lead_score,
        conversation_state: "awaiting_closing_intent",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

  if (vs.conversation_state === "awaiting_closing_intent") {
    const tier = vs.lead_score || "warm";

    if (tier === "cold") {
      return {
        reply: CONTACT_PREF_Q,
        vinciPatch: {
          ...blobPatch,
          conversation_state: "awaiting_contact_preference",
        },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }

    const yes = parseAffirmative(userMessage);
    const no = parseNegative(userMessage);
    if (no) {
      return {
        reply: SOFT_TO_CONTACT,
        vinciPatch: {
          ...blobPatch,
          conversation_state: "awaiting_contact_preference",
        },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }

    if (yes) {
      return {
        reply: CONTACT_PREF_Q,
        vinciPatch: {
          ...blobPatch,
          conversation_state: "awaiting_contact_preference",
        },
        saveUserMessage: true,
        saveAssistantMessage: true,
        completeHandoff: false,
        lastUserMessageForHandoff: userMessage,
      };
    }

    return {
      reply: `${CONTACT_PREF_Q}`,
      vinciPatch: {
        ...blobPatch,
        conversation_state: "awaiting_contact_preference",
      },
      saveUserMessage: true,
      saveAssistantMessage: true,
      completeHandoff: false,
      lastUserMessageForHandoff: userMessage,
    };
  }

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

  return {
    reply:
      "Tell me a bit more about what you are trying to fix or improve, and we will take it from there.",
    vinciPatch: { ...blobPatch },
    saveUserMessage: true,
    saveAssistantMessage: true,
    completeHandoff: false,
    lastUserMessageForHandoff: userMessage,
  };
}
