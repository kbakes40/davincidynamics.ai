/**
 * Kevin follow-up copy + BlueBubbles send + tracking updates.
 */

import type { VinciHandoffRecord } from "../types/handoff";
import { getVinciFollowupDelayMs, isBlueBubblesFollowupEnabled } from "../config/env";
import { sendBlueBubblesText } from "./bluebubblesService";
import {
  hasAlreadySentBlueBubbles,
  markBlueBubblesFailed,
  markBlueBubblesSent,
  markFollowupSkippedMissingPhone,
  markInvalidPhoneSkipped,
  markManualReview,
} from "./leadTrackingService";
import { canSendBlueBubbles, normalizePhoneNumber } from "./validationService";

const MSG_HOT = `Hey, this is Kevin from DaVinci Dynamics.

Just reviewed your notes.

Based on what you shared, there's definitely something we can tighten up pretty quickly to improve how things are performing.

Let's not overcomplicate it.

When are you free to run through it?`;

const MSG_WARM = `Hey, this is Kevin from DaVinci Dynamics.

I took a look at your conversation and just wanted to follow up.

There are a few areas that could likely be tightened up to improve consistency.

No pressure at all, but if you want, we can map it out so you have a clearer direction.

What's your schedule like?`;

function mainProblemPhrase(main: string | undefined): string | null {
  if (!main || main === "other") return null;
  return main.replace(/_/g, " ");
}

export function buildKevinFollowupMessage(handoff: VinciHandoffRecord): string {
  const score = handoff.lead_score;
  if (score === "hot") return MSG_HOT;
  if (score === "warm") return MSG_WARM;

  const phrase = mainProblemPhrase(handoff.main_problem);
  const middle = phrase
    ? `There are likely a few things we can tighten up around ${phrase}.`
    : `There are likely a few things we can tighten up on your side.`;

  return `Hey, this is Kevin from DaVinci Dynamics.

Saw your conversation and had a quick look.

${middle}

If you want, we can map it out quickly.

What's your availability like this week?`;
}

export async function sendKevinFollowup(handoff: VinciHandoffRecord): Promise<void> {
  if (!isBlueBubblesFollowupEnabled()) {
    console.log(`[kevinFollowup] BlueBubbles disabled; skip send handoff=${handoff.handoff_id}`);
    return;
  }

  if (await hasAlreadySentBlueBubbles(handoff.handoff_id)) {
    console.log(`[kevinFollowup] duplicate skip handoff=${handoff.handoff_id}`);
    return;
  }

  const gate = canSendBlueBubbles(handoff);
  if (!gate.ok) {
    const r = gate.reason ?? "cannot_send";
    if (r === "missing_phone") {
      await markFollowupSkippedMissingPhone(handoff.handoff_id);
    } else if (
      r === "unparseable_phone" ||
      r === "invalid_phone_length" ||
      r === "validation_failed"
    ) {
      await markInvalidPhoneSkipped(handoff.handoff_id);
    } else {
      await markManualReview(handoff.handoff_id, r);
    }
    return;
  }

  const normalized = normalizePhoneNumber(handoff.phone);
  if (!normalized) {
    await markInvalidPhoneSkipped(handoff.handoff_id);
    return;
  }

  const fromHandle = process.env.BLUEBUBBLES_FROM_HANDLE!.trim();
  const message = buildKevinFollowupMessage(handoff);
  const e164ish = normalized.length === 10 ? `+1${normalized}` : `+${normalized}`;

  const result = await sendBlueBubblesText({
    phoneNumber: e164ish,
    message,
    fromHandle,
  });

  if (!result.ok) {
    await markBlueBubblesFailed(handoff.handoff_id, result.error);
    return;
  }

  await markBlueBubblesSent(handoff.handoff_id, result.messageId);
}

/**
 * In-process delay before send. TODO(production): enqueue to Redis/SQS/Worker and remove setTimeout.
 */
export function scheduleKevinFollowup(handoff: VinciHandoffRecord): void {
  const delayMs = getVinciFollowupDelayMs();
  console.log(
    `[kevinFollowup] scheduled in ${delayMs / 60000} min handoff=${handoff.handoff_id} (TODO: use job queue in production)`
  );
  setTimeout(() => {
    void sendKevinFollowup(handoff).catch((e) => {
      console.error("[kevinFollowup] sendKevinFollowup error:", e);
      void markBlueBubblesFailed(
        handoff.handoff_id,
        e instanceof Error ? e.message : String(e)
      );
    });
  }, delayMs);
}
