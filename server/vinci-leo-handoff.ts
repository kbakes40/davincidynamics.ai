/**
 * Vinci → Leo internal handoff (customer never interacts with Leo).
 */

import { randomUUID } from "crypto";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { vinciHandoffs } from "../drizzle/schema";
import type { NewVinciHandoff } from "../drizzle/schema";
import { getVinciBookingUrl } from "./vinci-prompt";
import type { VinciStartSource } from "./vinci-start";

/** @deprecated use vinci-conversation-machine VINCI_CLOSING_MESSAGE */
export const VINCI_CLOSING_CUSTOMER_TEXT = `Perfect.

I've got what I need.

We'll follow up with you shortly. ⚙️`;

const ALLOWED = {
  source: [
    "home",
    "pricing",
    "demo",
    "solutions",
    "about",
    "contact",
    "audit",
    "ads",
    "unknown",
  ],
  business_type: [
    "small_business",
    "telecom",
    "ecommerce",
    "service_business",
    "agency",
    "local_business",
    "other",
  ],
  main_problem: [
    "leads",
    "follow_up",
    "conversion",
    "automation",
    "website_performance",
    "other",
  ],
  current_setup: [
    "has_website",
    "has_system",
    "starting_fresh",
    "partial_setup",
    "unknown",
  ],
  urgency: ["ready_now", "soon", "exploring", "unknown"],
  lead_score: ["hot", "warm", "cold"],
  contact_preference: ["telegram", "phone", "email", "both", "unknown"],
} as const;

function pick<T extends string>(val: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof val === "string" && (allowed as readonly string[]).includes(val)) {
    return val as T;
  }
  return fallback;
}

export function isVinciClosingMessage(assistantMessage: string): boolean {
  const stripped = assistantMessage
    .replace(/\*+|_+/g, "")
    .replace(/\u2019/g, "'")
    .trim()
    .toLowerCase();
  return (
    stripped.includes("perfect.") &&
    stripped.includes("i've got what i need") &&
    stripped.includes("we'll follow up") &&
    stripped.includes("shortly")
  );
}

function transcriptHasBookingLink(transcript: string): boolean {
  const url = getVinciBookingUrl();
  return transcript.includes(url) || transcript.includes("/booking");
}

function transcriptHasEmail(transcript: string): boolean {
  return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(transcript);
}

function transcriptHasPhone(transcript: string): boolean {
  return /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/.test(transcript);
}

type Extracted = {
  lead_name?: string;
  business_type?: string;
  main_problem?: string;
  current_setup?: string;
  urgency?: string;
  lead_score?: string;
  contact_preference?: string;
  phone?: string;
  email?: string;
  summary?: string;
  vinci_notes?: string;
  booking_link_sent?: boolean;
};

async function extractHandoffWithLLM(
  transcript: string,
  fallbackSource: VinciStartSource
): Promise<Extracted> {
  const system = `You extract structured data from a Vinci (DaVinci Dynamics) Telegram qualification transcript.
Output a single JSON object only. No markdown.

Enums (use exactly these strings):
- business_type: small_business | telecom | ecommerce | service_business | agency | local_business | other
- main_problem: leads | follow_up | conversion | automation | website_performance | other
- current_setup: has_website | has_system | starting_fresh | partial_setup | unknown
- urgency: ready_now | soon | exploring | unknown
- lead_score: hot | warm | cold
- contact_preference: telegram | phone | email | unknown

Fields:
- lead_name: string or null
- phone: string or null
- email: string or null
- summary: one short premium paragraph for Kevin (natural, like: "Prospect runs X... dealing with Y... Z setup... intent... treat as warm/hot.")
- vinci_notes: short internal bullet-style string for Kevin (not shown to customer)
- booking_link_sent: boolean (true if assistant shared a booking URL)
- business_type, main_problem, current_setup, urgency, lead_score, contact_preference: as above

If unknown, use "other" or "unknown" as appropriate for that field.`;

  try {
    const res = await invokeLLM({
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Known landing source from system (if not contradicted by chat): ${fallbackSource}\n\n--- TRANSCRIPT ---\n${transcript.slice(0, 12000)}`,
        },
      ],
      responseFormat: { type: "json_object" },
    });
    const raw = res.choices[0]?.message?.content;
    const text = typeof raw === "string" ? raw : JSON.stringify(raw);
    return JSON.parse(text) as Extracted;
  } catch (e) {
    console.error("[Vinci Handoff] LLM extract failed:", e);
    return {};
  }
}

function formatLeoMessage(row: NewVinciHandoff): string {
  const createdAt = new Date().toISOString();
  const uname =
    row.telegramUsername &&
    (row.telegramUsername.startsWith("@")
      ? row.telegramUsername
      : `@${row.telegramUsername}`);
  const lines = [
    `Vinci handoff (internal — Kevin)`,
    ``,
    `handoff_id: ${row.handoffId}`,
    `created_at: ${createdAt}`,
    `source: ${row.source}`,
    `telegram_user_id: ${row.telegramUserId}`,
    uname ? `telegram_username: ${uname}` : `telegram_username: —`,
    row.leadName ? `lead_name: ${row.leadName}` : `lead_name: —`,
    `business_type: ${row.businessType}`,
    `main_problem: ${row.mainProblem}`,
    `current_setup: ${row.currentSetup}`,
    `urgency: ${row.urgency}`,
    `lead_score: ${row.leadScore}`,
    `contact_preference: ${row.contactPreference}`,
    row.phone ? `phone: ${row.phone}` : `phone: —`,
    row.email ? `email: ${row.email}` : `email: —`,
    `booking_link_sent: ${row.bookingLinkSent ? "yes" : "no"}`,
    `contact_captured: ${row.contactCaptured ? "yes" : "no"}`,
    `handoff_status: ${row.handoffStatus}`,
    `assigned_to: ${row.assignedTo}`,
    `conversation_id: ${row.conversationId ?? "—"}`,
    `bot_user_id: ${row.botUserId ?? "—"}`,
    ``,
    `summary:`,
    row.summary || "—",
    ``,
    `last_user_message:`,
    row.lastUserMessage || "—",
    ``,
    `vinci_notes:`,
    row.vinciNotes || "—",
  ];
  return lines.join("\n");
}

async function sendLeoTelegram(text: string): Promise<number | undefined> {
  const token = process.env.TELEGRAM_HANDOFF_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[Vinci Handoff] TELEGRAM_HANDOFF_BOT_TOKEN or TELEGRAM_CHAT_ID missing — Leo notify skipped");
    return undefined;
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
    const data = (await response.json()) as { ok?: boolean; result?: { message_id?: number } };
    if (!response.ok || !data.ok) {
      console.error("[Vinci Handoff] Leo sendMessage failed:", data);
      return undefined;
    }
    return data.result?.message_id;
  } catch (e) {
    console.error("[Vinci Handoff] Leo send exception:", e);
    return undefined;
  }
}

export interface VinciHandoffContext {
  conversationId: number;
  botUserId: number;
  telegramUserId: string;
  telegramUsername?: string;
  leadName?: string;
  source: VinciStartSource;
  lastUserMessage: string;
  transcript: string;
}

export async function createVinciHandoffRecordAndNotifyLeo(
  ctx: VinciHandoffContext
): Promise<{ handoffId: string; inserted: boolean }> {
  const handoffId = `vh_${randomUUID().replace(/-/g, "")}`;
  const extracted = await extractHandoffWithLLM(ctx.transcript, ctx.source);

  const bookingSent =
    Boolean(extracted.booking_link_sent) || transcriptHasBookingLink(ctx.transcript);
  const phone = extracted.phone?.trim() || undefined;
  const email = extracted.email?.trim() || undefined;
  const contactCaptured = Boolean(
    phone || email || transcriptHasPhone(ctx.transcript) || transcriptHasEmail(ctx.transcript)
  );

  const row: NewVinciHandoff = {
    handoffId,
    conversationId: ctx.conversationId,
    botUserId: ctx.botUserId,
    source: ctx.source,
    telegramUserId: ctx.telegramUserId,
    telegramUsername: ctx.telegramUsername ?? null,
    leadName: extracted.lead_name?.trim() || ctx.leadName || null,
    businessType: pick(extracted.business_type, ALLOWED.business_type, "other"),
    mainProblem: pick(extracted.main_problem, ALLOWED.main_problem, "other"),
    currentSetup: pick(extracted.current_setup, ALLOWED.current_setup, "unknown"),
    urgency: pick(extracted.urgency, ALLOWED.urgency, "unknown"),
    leadScore: pick(extracted.lead_score, ALLOWED.lead_score, "cold"),
    contactPreference: pick(
      extracted.contact_preference,
      ALLOWED.contact_preference,
      "unknown"
    ),
    phone: phone ?? null,
    email: email ?? null,
    summary: extracted.summary?.trim() || null,
    lastUserMessage: ctx.lastUserMessage.slice(0, 4000) || null,
    vinciNotes: extracted.vinci_notes?.trim() || null,
    handoffStatus: "pending",
    assignedTo: "Leo",
    bookingLinkSent: bookingSent ? 1 : 0,
    contactCaptured: contactCaptured ? 1 : 0,
  };

  const db = await getDb();
  let inserted = false;
  if (db) {
    try {
      await db.insert(vinciHandoffs).values(row);
      inserted = true;
    } catch (e) {
      console.error("[Vinci Handoff] DB insert failed:", e);
    }
  } else {
    console.error("[Vinci Handoff] DB unavailable — handoff row not persisted");
  }

  const leoText = formatLeoMessage(row);
  await sendLeoTelegram(leoText);

  return { handoffId, inserted };
}

export interface VinciStructuredHandoffInput {
  conversationId: number;
  botUserId: number;
  telegramUserId: string;
  telegramUsername?: string;
  leadName?: string;
  source: VinciStartSource;
  lastUserMessage: string;
  transcript: string;
  businessType: string;
  mainProblem: string;
  currentSetup: string;
  urgency: string;
  leadScore: string;
  contactPreference: string;
  phone?: string;
  email?: string;
  demoInterest?: string;
}

function humanPhrase(s: string): string {
  return s.replace(/_/g, " ");
}

function buildSummaryFromStructured(i: VinciStructuredHandoffInput): string {
  const score = i.leadScore || "warm";
  const biz = humanPhrase(i.businessType);
  const focus = humanPhrase(i.mainProblem);
  const setup =
    i.currentSetup === "has_website"
      ? "Already has a website in place."
      : i.currentSetup === "has_system"
        ? "Already has a system or stack in place."
        : i.currentSetup === "starting_fresh"
          ? "Starting fresh without much in place yet."
          : i.currentSetup === "partial_setup"
            ? "Has a partial setup or mixed tooling."
            : "Current setup is unclear from the thread.";
  const timing =
    i.urgency === "ready_now"
      ? "Shows strong near-term intent."
      : i.urgency === "soon"
        ? "Shows near-term intent."
        : i.urgency === "exploring"
          ? "Still exploring and not urgent."
          : "Timing and urgency are unclear.";
  return `Prospect runs a ${biz} and is trying to improve ${focus}. ${setup} ${timing} Should be treated as a ${score} lead.`;
}

function buildVinciNotesFromStructured(i: VinciStructuredHandoffInput): string {
  const lines = [
    `source=${i.source}`,
    i.demoInterest ? `demo_interest=${i.demoInterest.slice(0, 200)}` : null,
    `business_type=${i.businessType}`,
    `main_problem=${i.mainProblem}`,
    `current_setup=${i.currentSetup}`,
    `urgency=${i.urgency}`,
    `contact_preference=${i.contactPreference}`,
    i.phone ? `phone=${i.phone}` : null,
    i.email ? `email=${i.email}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Persist + notify Leo using state-machine fields (no LLM extract). */
export async function createVinciHandoffFromStructured(
  input: VinciStructuredHandoffInput
): Promise<{ handoffId: string; inserted: boolean }> {
  const handoffId = `vh_${randomUUID().replace(/-/g, "")}`;
  const summary = buildSummaryFromStructured(input);
  const vinciNotes = buildVinciNotesFromStructured(input);
  const bookingSent = transcriptHasBookingLink(input.transcript);
  const contactCaptured = Boolean(
    input.phone ||
      input.email ||
      transcriptHasPhone(input.transcript) ||
      transcriptHasEmail(input.transcript)
  );

  const row: NewVinciHandoff = {
    handoffId,
    conversationId: input.conversationId,
    botUserId: input.botUserId,
    source: input.source,
    telegramUserId: input.telegramUserId,
    telegramUsername: input.telegramUsername ?? null,
    leadName: input.leadName ?? null,
    businessType: pick(input.businessType, ALLOWED.business_type, "other"),
    mainProblem: pick(input.mainProblem, ALLOWED.main_problem, "other"),
    currentSetup: pick(input.currentSetup, ALLOWED.current_setup, "unknown"),
    urgency: pick(input.urgency, ALLOWED.urgency, "unknown"),
    leadScore: pick(input.leadScore, ALLOWED.lead_score, "warm"),
    contactPreference: pick(
      input.contactPreference,
      ALLOWED.contact_preference,
      "unknown"
    ),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    summary,
    lastUserMessage: input.lastUserMessage.slice(0, 4000) || null,
    vinciNotes,
    handoffStatus: "pending",
    assignedTo: "Leo",
    bookingLinkSent: bookingSent ? 1 : 0,
    contactCaptured: contactCaptured ? 1 : 0,
  };

  const db = await getDb();
  let inserted = false;
  if (db) {
    try {
      await db.insert(vinciHandoffs).values(row);
      inserted = true;
    } catch (e) {
      console.error("[Vinci Handoff] structured DB insert failed:", e);
    }
  } else {
    console.error("[Vinci Handoff] DB unavailable — structured handoff not persisted");
  }

  await sendLeoTelegram(formatLeoMessage(row));
  return { handoffId, inserted };
}

export function scheduleDeleteVinciClosingMessage(
  chatId: number,
  messageId: number,
  delayMs: number = 5 * 60 * 1000
): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !messageId) return;

  setTimeout(() => {
    void fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.text();
        console.warn("[Vinci] deleteMessage (optional) failed:", err);
      }
    });
  }, delayMs);
}
