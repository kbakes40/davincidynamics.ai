/**
 * Shared Vinci → internal follow-up handoff shape (maps to `vinci_handoffs` + pipeline state).
 */

export type HandoffSource =
  | "home"
  | "pricing"
  | "demo"
  | "solutions"
  | "about"
  | "contact"
  | "audit"
  | "ads"
  | "unknown";

export type HandoffBusinessType =
  | "small_business"
  | "telecom"
  | "ecommerce"
  | "service_business"
  | "agency"
  | "local_business"
  | "other";

export type HandoffMainProblem =
  | "leads"
  | "follow_up"
  | "conversion"
  | "automation"
  | "website_performance"
  | "other";

export type HandoffCurrentSetup =
  | "has_website"
  | "has_system"
  | "starting_fresh"
  | "partial_setup"
  | "unknown";

export type HandoffUrgency = "ready_now" | "soon" | "exploring" | "unknown";

export type HandoffLeadScore = "hot" | "warm" | "cold";

/** Vinci / internal pipeline status (not BlueBubbles delivery). */
export type HandoffStatus =
  | "pending"
  | "ready_for_followup"
  | "manual_review"
  | "completed";

export type BlueBubblesStatus = "pending" | "sent" | "failed" | "skipped";

/**
 * Canonical handoff record (aligned with DB row + follow-up fields).
 */
export interface VinciHandoffRecord {
  handoff_id: string;
  created_at: Date;
  source: HandoffSource;
  telegram_user_id: string;
  telegram_username: string | null;
  lead_name: string | null;
  business_type: HandoffBusinessType;
  main_problem: HandoffMainProblem;
  current_setup: HandoffCurrentSetup;
  urgency: HandoffUrgency;
  lead_score: HandoffLeadScore;
  contact_preference: string;
  phone: string | null;
  email: string | null;
  summary: string | null;
  last_user_message: string | null;
  vinci_notes: string | null;
  handoff_status: HandoffStatus;
  assigned_to: string;
  followup_channel: string | null;
  contact_captured: boolean;
  bluebubbles_sent_at: Date | null;
  bluebubbles_status: BlueBubblesStatus | null;
  bluebubbles_message_id: string | null;
  invalid_phone: boolean;
}
