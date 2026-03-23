/**
 * Vinci completion → persist handoff → validate → schedule Kevin BlueBubbles follow-up.
 * Customer stays on Telegram with Vinci only; BlueBubbles is internal.
 */

import { desc, eq } from "drizzle-orm";
import { conversations, vinciHandoffs } from "../drizzle/schema";
import type { VinciHandoff } from "../drizzle/schema";
import { getDb } from "../server/db";
import {
  createVinciHandoffFromStructured,
  buildSummaryFromStructured,
  type VinciStructuredHandoffInput,
} from "../server/vinci-leo-handoff";
import type { BlueBubblesStatus, VinciHandoffRecord } from "../types/handoff";
import { isBlueBubblesFollowupEnabled } from "../config/env";
import { canSendBlueBubbles, validateHandoffForFollowup } from "./validationService";
import {
  hasAlreadySentBlueBubbles,
  markFollowupSkippedMissingPhone,
  markInvalidPhoneSkipped,
  markManualReview,
  markReadyForFollowup,
} from "./leadTrackingService";
import { scheduleKevinFollowup } from "./kevinFollowupService";

const LEGACY_VINCI_METADATA_KEY = "revenueEngine";

export type { VinciStructuredHandoffInput };

export function buildVinciSummary(input: VinciStructuredHandoffInput): string {
  return buildSummaryFromStructured(input);
}

function mapRowToRecord(row: VinciHandoff): VinciHandoffRecord {
  return {
    handoff_id: row.handoffId,
    created_at: row.createdAt,
    source: row.source as VinciHandoffRecord["source"],
    telegram_user_id: row.telegramUserId,
    telegram_username: row.telegramUsername ?? null,
    lead_name: row.leadName ?? null,
    business_type: row.businessType as VinciHandoffRecord["business_type"],
    main_problem: row.mainProblem as VinciHandoffRecord["main_problem"],
    current_setup: row.currentSetup as VinciHandoffRecord["current_setup"],
    urgency: row.urgency as VinciHandoffRecord["urgency"],
    lead_score: row.leadScore as VinciHandoffRecord["lead_score"],
    contact_preference: row.contactPreference,
    phone: row.phone ?? null,
    email: row.email ?? null,
    summary: row.summary ?? null,
    last_user_message: row.lastUserMessage ?? null,
    vinci_notes: row.vinciNotes ?? null,
    handoff_status: row.handoffStatus as VinciHandoffRecord["handoff_status"],
    assigned_to: row.assignedTo,
    followup_channel: row.followupChannel ?? null,
    contact_captured: row.contactCaptured === 1,
    bluebubbles_sent_at: row.bluebubblesSentAt ?? null,
    bluebubbles_status: (row.bluebubblesStatus as BlueBubblesStatus | null) ?? "pending",
    bluebubbles_message_id: row.bluebubblesMessageId ?? null,
    invalid_phone: row.invalidPhone === 1,
  };
}

async function loadHandoffRecord(handoffId: string): Promise<VinciHandoffRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(vinciHandoffs)
    .where(eq(vinciHandoffs.handoffId, handoffId))
    .limit(1);
  if (rows.length === 0) return null;
  return mapRowToRecord(rows[0]);
}

async function runFollowupPipeline(record: VinciHandoffRecord): Promise<void> {
  try {
    if (await hasAlreadySentBlueBubbles(record.handoff_id)) {
      console.log(`[vinciHandoff] duplicate pipeline skip handoff=${record.handoff_id}`);
      return;
    }

    const phoneVal = validateHandoffForFollowup(record);
    if (!phoneVal.isValid) {
      if (phoneVal.reason === "missing_phone") {
        await markFollowupSkippedMissingPhone(record.handoff_id);
      } else {
        await markInvalidPhoneSkipped(record.handoff_id);
      }
      return;
    }

    const gate = canSendBlueBubbles(record);
    if (!gate.ok) {
      await markManualReview(record.handoff_id, gate.reason ?? "cannot_send_bluebubbles");
      return;
    }

    if (!isBlueBubblesFollowupEnabled()) {
      console.log(
        `[vinciHandoff] BLUEBUBBLES_FOLLOWUP_ENABLED off; handoff=${record.handoff_id} stays pending for manual follow-up`
      );
      return;
    }

    await markReadyForFollowup(record.handoff_id);
    const refreshed = await loadHandoffRecord(record.handoff_id);
    scheduleKevinFollowup(refreshed ?? { ...record, handoff_status: "ready_for_followup" });
  } catch (e) {
    console.error("[vinciHandoff] follow-up pipeline error:", e);
  }
}

/**
 * Persist handoff from Vinci state machine, then validate and schedule internal Kevin follow-up.
 */
export async function createVinciHandoff(
  input: VinciStructuredHandoffInput
): Promise<{ handoffId: string; inserted: boolean }> {
  const { handoffId, inserted } = await createVinciHandoffFromStructured(input);
  if (!inserted) {
    return { handoffId, inserted };
  }
  const record = await loadHandoffRecord(handoffId);
  if (record) {
    await runFollowupPipeline(record);
  }
  return { handoffId, inserted };
}

/**
 * Mark conversation ended and store handoff completion in metadata (latest vinci_handoffs row for this conversation).
 */
export async function markConversationCompleted(conversationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const ho = await db
    .select({ handoffId: vinciHandoffs.handoffId })
    .from(vinciHandoffs)
    .where(eq(vinciHandoffs.conversationId, conversationId))
    .orderBy(desc(vinciHandoffs.id))
    .limit(1);
  const handoffId = ho[0]?.handoffId ?? "";

  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (conv.length === 0) return;

  let meta: Record<string, unknown> = {};
  try {
    meta = conv[0].metadata ? (JSON.parse(conv[0].metadata as string) as Record<string, unknown>) : {};
  } catch {
    meta = {};
  }

  const vinciRaw = meta.vinci;
  const prev =
    typeof vinciRaw === "object" && vinciRaw !== null
      ? (vinciRaw as Record<string, unknown>)
      : {};
  const legacyRaw = meta[LEGACY_VINCI_METADATA_KEY];
  const legacyState =
    typeof legacyRaw === "object" && legacyRaw !== null
      ? (legacyRaw as Record<string, unknown>)
      : {};
  const base = Object.keys(prev).length > 0 ? prev : legacyState;

  const vinci = { ...base, handoffCompleted: true, handoffId };
  const next: Record<string, unknown> = { ...meta, vinci, handedOff: true };
  delete next[LEGACY_VINCI_METADATA_KEY];

  await db
    .update(conversations)
    .set({
      endedAt: new Date(),
      metadata: JSON.stringify(next),
    })
    .where(eq(conversations.id, conversationId));
}
