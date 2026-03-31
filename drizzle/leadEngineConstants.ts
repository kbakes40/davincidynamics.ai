/** Shared Lead Engine enum value lists — used by MySQL schema (legacy) and Postgres (Supabase). */

export const leadEngineLeadStatuses = [
  "new",
  "enriched",
  "validated",
  "qualified",
  "unqualified",
  "archived",
] as const;

export const leadEngineOutreachStatuses = [
  "new",
  "researched",
  "drafted",
  "ready_to_send",
  "sent",
  "replied",
  "interested",
  "not_interested",
  "follow_up_needed",
] as const;

export const leadEnginePriorities = ["low", "medium", "high", "urgent"] as const;
export type LeadEnginePriority = (typeof leadEnginePriorities)[number];

export const leadEnginePipelineStages = [
  "new_lead",
  "verified",
  "site_reviewed",
  "outreach_ready",
  "contacted",
  "follow_up",
  "closed_won",
  "closed_lost",
] as const;

export const leadEngineVerificationStatuses = ["unverified", "pending", "verified", "failed"] as const;

export const leadEngineImportBatchStatuses = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const;

export const leadEngineContactPointTypes = [
  "phone",
  "email",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "other",
] as const;

export const leadEngineAgentQueueStatuses = [
  "pending",
  "active",
  "completed",
  "skipped",
] as const;
