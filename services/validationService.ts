/**
 * Normalize / validate phone and handoff readiness for BlueBubbles follow-up.
 */

import type { VinciHandoffRecord } from "../types/handoff";

export type ValidationResult = {
  isValid: boolean;
  normalizedPhone: string | null;
  reason: string | null;
};

const US_DIGITS = /^\d{10}$/;
const US_WITH_COUNTRY = /^\+?1?(\d{10})$/;

/** Strip non-digits; keep last 10 for US-style numbers when applicable. */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (phone == null || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  if (digits.length >= 7) {
    return digits;
  }
  return null;
}

export function validatePhoneNumber(phone: string | null | undefined): ValidationResult {
  const normalized = normalizePhoneNumber(phone);
  if (!phone?.trim()) {
    return { isValid: false, normalizedPhone: null, reason: "missing_phone" };
  }
  if (!normalized) {
    return { isValid: false, normalizedPhone: null, reason: "unparseable_phone" };
  }
  if (normalized.length === 10 && US_DIGITS.test(normalized)) {
    return { isValid: true, normalizedPhone: normalized, reason: null };
  }
  if (normalized.length >= 10) {
    return { isValid: true, normalizedPhone: normalized, reason: null };
  }
  return { isValid: false, normalizedPhone: normalized, reason: "invalid_phone_length" };
}

export function validateHandoffForFollowup(handoff: VinciHandoffRecord): ValidationResult {
  const phoneCheck = validatePhoneNumber(handoff.phone);
  if (!phoneCheck.isValid) {
    return phoneCheck;
  }
  return { isValid: true, normalizedPhone: phoneCheck.normalizedPhone, reason: null };
}

export function canSendBlueBubbles(handoff: VinciHandoffRecord): { ok: boolean; reason: string | null } {
  if (handoff.bluebubbles_sent_at != null) {
    return { ok: false, reason: "already_sent_at_set" };
  }
  if (handoff.bluebubbles_status === "sent") {
    return { ok: false, reason: "status_already_sent" };
  }
  const v = validateHandoffForFollowup(handoff);
  if (!v.isValid) {
    return { ok: false, reason: v.reason ?? "validation_failed" };
  }
  return { ok: true, reason: null };
}
