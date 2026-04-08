/**
 * Lead Engine tables on Turso (libSQL/SQLite).
 * Column names are unchanged from the prior PostgreSQL schema for zero app-code changes.
 */
import { index, integer, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import {
  leadEngineAgentQueueStatuses,
  leadEngineContactPointTypes,
  leadEngineImportBatchStatuses,
  leadEngineLeadStatuses,
  leadEngineOutreachStatuses,
  leadEnginePipelineStages,
  leadEnginePriorities,
  leadEngineVerificationStatuses,
} from "./leadEngineConstants";

// Re-export typed union helpers so downstream code that imported pgEnums can use these instead
export type LeadEngineLeadStatus = (typeof leadEngineLeadStatuses)[number];
export type LeadEngineOutreachStatus = (typeof leadEngineOutreachStatuses)[number];
export type LeadEnginePriority = (typeof leadEnginePriorities)[number];
export type LeadEnginePipelineStage = (typeof leadEnginePipelineStages)[number];
export type LeadEngineVerificationStatus = (typeof leadEngineVerificationStatuses)[number];
export type LeadEngineImportBatchStatus = (typeof leadEngineImportBatchStatuses)[number];
export type LeadEngineContactPointType = (typeof leadEngineContactPointTypes)[number];
export type LeadEngineAgentQueueStatus = (typeof leadEngineAgentQueueStatuses)[number];

export const leadEngineLeads = sqliteTable(
  "lead_engine_leads",
  {
    id: text("id").primaryKey(),
    businessName: text("business_name").notNull(),
    ownerName: text("owner_name"),
    category: text("category").notNull().default(""),
    subcategory: text("subcategory"),
    source: text("source").notNull().default("import"),
    sourceRecordId: text("source_record_id"),
    targetZip: text("target_zip"),
    radiusMiles: integer("radius_miles"),
    contactedAt: integer("contacted_at", { mode: "timestamp" }),
    followUpAt: integer("follow_up_at", { mode: "timestamp" }),
    outreachPrep: text("outreach_prep"),
    leadStatus: text("lead_status").notNull().default("new"),
    outreachStatus: text("outreach_status").notNull().default("new"),
    priority: text("priority").notNull().default("low"),
    score: integer("score").notNull().default(0),
    scoreReason: text("score_reason"),
    notesJson: text("notes_json"),
    reasonCodesJson: text("reason_codes_json"),
    tagsJson: text("tags_json"),
    pipelineStage: text("pipeline_stage").notNull().default("new_lead"),
    verificationStatus: text("verification_status").notNull().default("unverified"),
    assignedOwner: text("assigned_owner"),
    sourceJobId: text("source_job_id"),
    googleMapsUrl: text("google_maps_url"),
    normalizedBusinessName: text("normalized_business_name").notNull().default(""),
    normalizedPhone: text("normalized_phone"),
    normalizedWebsite: text("normalized_website"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    lastVerifiedAt: integer("last_verified_at", { mode: "timestamp" }),
  },
  t => [
    index("idx_lead_engine_norm_phone").on(t.normalizedPhone),
    index("idx_lead_engine_norm_site").on(t.normalizedWebsite),
    index("idx_lead_engine_norm_name").on(t.normalizedBusinessName),
    index("idx_lead_engine_pipeline").on(t.pipelineStage),
    index("idx_lead_engine_score").on(t.score),
    index("idx_lead_engine_source_record_id").on(t.sourceRecordId),
    index("idx_lead_engine_priority").on(t.priority),
    index("idx_lead_engine_source").on(t.source),
  ]
);

export const leadEngineContactPoints = sqliteTable(
  "lead_engine_contact_points",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    type: text("type").notNull(),
    value: text("value").notNull(),
    isPrimary: integer("is_primary").notNull().default(1),
    isVerified: integer("is_verified").notNull().default(0),
    verificationStatus: text("verification_status").notNull().default("unknown"),
    source: text("source").notNull().default("import"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [index("idx_lead_engine_cp_lead").on(t.leadId)]
);

export const leadEngineAddresses = sqliteTable(
  "lead_engine_addresses",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    address1: text("address_1"),
    city: text("city").notNull().default(""),
    state: text("state").notNull().default(""),
    zip: text("zip"),
    country: text("country").notNull().default("US"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    serviceRadiusMiles: integer("service_radius_miles"),
  },
  t => [index("idx_lead_engine_addr_lead").on(t.leadId)]
);

export const leadEngineSources = sqliteTable(
  "lead_engine_sources",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    sourceName: text("source_name").notNull(),
    sourceType: text("source_type").notNull().default("csv"),
    importBatchId: text("import_batch_id"),
    rawPayloadJson: text("raw_payload_json"),
    sourceUrl: text("source_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [
    index("idx_lead_engine_src_lead").on(t.leadId),
    index("idx_lead_engine_src_batch").on(t.importBatchId),
  ]
);

export const leadEngineEnrichment = sqliteTable(
  "lead_engine_enrichment",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    websiteStatus: text("website_status").notNull().default("unknown"),
    googleBusinessProfile: text("google_business_profile"),
    facebook: text("facebook"),
    instagram: text("instagram"),
    linkedin: text("linkedin"),
    hasWebsite: integer("has_website").notNull().default(0),
    sslEnabled: integer("ssl_enabled"),
    mobileFriendly: integer("mobile_friendly"),
    pageSpeedScore: integer("page_speed_score"),
    hasContactForm: integer("has_contact_form"),
    hasBookingFlow: integer("has_booking_flow"),
    hasChatWidget: integer("has_chat_widget"),
    hasMetaPixel: integer("has_meta_pixel"),
    hasGoogleAnalytics: integer("has_google_analytics"),
    ecommercePlatform: text("ecommerce_platform"),
    crmDetected: text("crm_detected"),
    emailProvider: text("email_provider"),
    techStackJson: text("tech_stack_json"),
    finalUrl: text("final_url"),
    summary: text("summary"),
    socialPresence: text("social_presence"),
    estimatedMonthlyOrders: text("estimated_monthly_orders"),
    enrichedAt: integer("enriched_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [
    index("idx_lead_engine_enrichment_status").on(t.websiteStatus),
    unique("uq_lead_engine_enrichment_lead").on(t.leadId),
  ]
);

export const leadEngineScoringEvents = sqliteTable(
  "lead_engine_scoring_events",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    scoreChange: integer("score_change").notNull(),
    reason: text("reason").notNull(),
    ruleKey: text("rule_key").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [index("idx_lead_engine_score_lead").on(t.leadId)]
);

export const leadEngineOutreachEvents = sqliteTable(
  "lead_engine_outreach_events",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    channel: text("channel").notNull(),
    direction: text("direction").notNull(),
    eventType: text("event_type").notNull(),
    subject: text("subject"),
    messagePreview: text("message_preview"),
    sentBy: text("sent_by"),
    sentAt: integer("sent_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    replyAt: integer("reply_at", { mode: "timestamp" }),
    status: text("status"),
    externalMessageId: text("external_message_id"),
  },
  t => [index("idx_lead_engine_outreach_lead").on(t.leadId)]
);

export const leadEngineImportBatches = sqliteTable("lead_engine_import_batches", {
  id: text("id").primaryKey(),
  sourceName: text("source_name").notNull().default("csv"),
  fileName: text("file_name"),
  status: text("status").notNull().default("pending"),
  totalRows: integer("total_rows").notNull().default(0),
  insertedRows: integer("inserted_rows").notNull().default(0),
  updatedRows: integer("updated_rows").notNull().default(0),
  duplicateRows: integer("duplicate_rows").notNull().default(0),
  failedRows: integer("failed_rows").notNull().default(0),
  errorLog: text("error_log"),
  linkedLeadIdsJson: text("linked_lead_ids_json"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const leadEngineAgentQueues = sqliteTable(
  "lead_engine_agent_queues",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    assignedAgent: text("assigned_agent").notNull(),
    queueStatus: text("queue_status").notNull().default("pending"),
    reason: text("reason"),
    scheduledFor: integer("scheduled_for", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  t => [index("idx_lead_engine_aq_lead").on(t.leadId)]
);

export const leadEnginePipelineEvents = sqliteTable(
  "lead_engine_pipeline_events",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    fromStage: text("from_stage"),
    toStage: text("to_stage").notNull(),
    at: integer("at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    actor: text("actor").notNull().default("system"),
    note: text("note"),
  },
  t => [index("idx_lead_engine_pe_lead").on(t.leadId)]
);

export const leadEngineActivityLog = sqliteTable(
  "lead_engine_activity_log",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    at: integer("at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    actor: text("actor").notNull().default("system"),
  },
  t => [index("idx_lead_engine_act_lead").on(t.leadId)]
);

export const leadEngineCampaigns = sqliteTable(
  "lead_engine_campaigns",
  {
    id: text("id").primaryKey(),
    campaignName: text("campaign_name").notNull(),
    campaignType: text("campaign_type").notNull().default("outbound"),
    category: text("category"),
    targetAudience: text("target_audience"),
    channel: text("channel").notNull().default("email"),
    objective: text("objective"),
    status: text("status").notNull().default("draft"),
    owner: text("owner"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [index("idx_le_campaign_status").on(t.status), index("idx_le_campaign_channel").on(t.channel)]
);

export const leadEngineCampaignLeads = sqliteTable(
  "lead_engine_campaign_leads",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id").notNull(),
    leadId: text("lead_id").notNull(),
    pipelineId: text("pipeline_id"),
    stage: text("stage").notNull().default("new_lead"),
    outreachStatus: text("outreach_status").notNull().default("not_started"),
    assignedTo: text("assigned_to"),
    sequenceStep: integer("sequence_step").notNull().default(1),
    lastContactedAt: integer("last_contacted_at", { mode: "timestamp" }),
    nextFollowUpAt: integer("next_follow_up_at", { mode: "timestamp" }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  t => [
    index("idx_le_campaign_leads_campaign").on(t.campaignId),
    index("idx_le_campaign_leads_lead").on(t.leadId),
    unique("uq_le_campaign_lead").on(t.campaignId, t.leadId),
  ]
);

export type LeadEngineLeadRow = typeof leadEngineLeads.$inferSelect;
export type LeadEngineEnrichmentRow = typeof leadEngineEnrichment.$inferSelect;
