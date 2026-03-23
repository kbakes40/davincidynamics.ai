/**
 * Handoff row status updates — duplicate protection and BlueBubbles send tracking.
 */

import { eq } from "drizzle-orm";
import { vinciHandoffs } from "../drizzle/schema";
import { getDb } from "../server/db";

export async function markReadyForFollowup(handoffId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(vinciHandoffs)
    .set({ handoffStatus: "ready_for_followup" })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

export async function markManualReview(handoffId: string, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  console.warn(`[leadTracking] manual_review handoff=${handoffId} reason=${reason}`);
  await db
    .update(vinciHandoffs)
    .set({ handoffStatus: "manual_review" })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

/** Phone missing — no BlueBubbles; Kevin can follow up manually. */
export async function markFollowupSkippedMissingPhone(handoffId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  console.warn(`[leadTracking] skipped_missing_phone handoff=${handoffId}`);
  await db
    .update(vinciHandoffs)
    .set({
      handoffStatus: "manual_review",
      bluebubblesStatus: "skipped",
    })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

export async function markBlueBubblesSent(handoffId: string, messageId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(vinciHandoffs)
    .set({
      bluebubblesStatus: "sent",
      bluebubblesSentAt: new Date(),
      bluebubblesMessageId: messageId,
      handoffStatus: "completed",
    })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

export async function markBlueBubblesFailed(handoffId: string, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // TODO(production): single explicit retry — admin/job resets status from failed only after audit, then re-queue.
  console.error(`[leadTracking] bluebubbles_failed handoff=${handoffId} reason=${reason}`);
  await db
    .update(vinciHandoffs)
    .set({ bluebubblesStatus: "failed" })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

export async function markInvalidPhoneSkipped(handoffId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(vinciHandoffs)
    .set({
      invalidPhone: 1,
      bluebubblesStatus: "skipped",
      handoffStatus: "manual_review",
    })
    .where(eq(vinciHandoffs.handoffId, handoffId));
}

export async function hasAlreadySentBlueBubbles(handoffId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  const rows = await db
    .select({
      bluebubblesSentAt: vinciHandoffs.bluebubblesSentAt,
      bluebubblesStatus: vinciHandoffs.bluebubblesStatus,
    })
    .from(vinciHandoffs)
    .where(eq(vinciHandoffs.handoffId, handoffId))
    .limit(1);
  if (rows.length === 0) return false;
  const r = rows[0];
  if (r.bluebubblesSentAt != null) return true;
  if (r.bluebubblesStatus === "sent") return true;
  return false;
}
