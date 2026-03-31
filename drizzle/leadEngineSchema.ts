import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/** Distinct from public `leads` (website form captures). */
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

export const leadEngineLeads = mysqlTable(
  "lead_engine_leads",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    businessName: text("business_name").notNull(),
    ownerName: text("owner_name"),
    category: varchar("category", { length: 255 }).notNull().default(""),
    subcategory: varchar("subcategory", { length: 255 }),
    source: varchar("source", { length: 255 }).notNull().default("import"),
    sourceRecordId: varchar("source_record_id", { length: 255 }),
    targetZip: varchar("target_zip", { length: 32 }),
    radiusMiles: int("radius_miles"),
    contactedAt: timestamp("contacted_at"),
    followUpAt: timestamp("follow_up_at"),
    outreachPrep: text("outreach_prep"),
    leadStatus: mysqlEnum("lead_status", leadEngineLeadStatuses).notNull().default("new"),
    outreachStatus: mysqlEnum("outreach_status", leadEngineOutreachStatuses)
      .notNull()
      .default("new"),
    priority: mysqlEnum("priority", leadEnginePriorities).notNull().default("low"),
    score: int("score").notNull().default(0),
    scoreReason: text("score_reason"),
    notesJson: text("notes_json"),
    reasonCodesJson: text("reason_codes_json"),
    tagsJson: text("tags_json"),
    pipelineStage: mysqlEnum("pipeline_stage", leadEnginePipelineStages).notNull().default("new_lead"),
    verificationStatus: mysqlEnum("verification_status", leadEngineVerificationStatuses)
      .notNull()
      .default("unverified"),
    assignedOwner: varchar("assigned_owner", { length: 64 }),
    sourceJobId: varchar("source_job_id", { length: 64 }),
    googleMapsUrl: varchar("google_maps_url", { length: 1024 }),
    normalizedBusinessName: varchar("normalized_business_name", { length: 512 }).notNull().default(""),
    normalizedPhone: varchar("normalized_phone", { length: 64 }),
    normalizedWebsite: varchar("normalized_website", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    lastVerifiedAt: timestamp("last_verified_at"),
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

export const leadEngineContactPoints = mysqlTable(
  "lead_engine_contact_points",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    type: mysqlEnum("type", leadEngineContactPointTypes).notNull(),
    value: text("value").notNull(),
    isPrimary: int("is_primary").notNull().default(1),
    isVerified: int("is_verified").notNull().default(0),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("unknown"),
    source: varchar("source", { length: 64 }).notNull().default("import"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  t => [index("idx_lead_engine_cp_lead").on(t.leadId)]
);

export const leadEngineAddresses = mysqlTable(
  "lead_engine_addresses",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    address1: text("address_1"),
    city: varchar("city", { length: 128 }).notNull().default(""),
    state: varchar("state", { length: 64 }).notNull().default(""),
    zip: varchar("zip", { length: 32 }),
    country: varchar("country", { length: 64 }).notNull().default("US"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    serviceRadiusMiles: int("service_radius_miles"),
  },
  t => [index("idx_lead_engine_addr_lead").on(t.leadId)]
);

export const leadEngineSources = mysqlTable(
  "lead_engine_sources",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    sourceName: varchar("source_name", { length: 128 }).notNull(),
    sourceType: varchar("source_type", { length: 64 }).notNull().default("csv"),
    importBatchId: varchar("import_batch_id", { length: 32 }),
    rawPayloadJson: text("raw_payload_json"),
    sourceUrl: varchar("source_url", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  t => [index("idx_lead_engine_src_lead").on(t.leadId), index("idx_lead_engine_src_batch").on(t.importBatchId)]
);

export const leadEngineEnrichment = mysqlTable("lead_engine_enrichment", {
  id: varchar("id", { length: 32 }).primaryKey(),
  leadId: varchar("lead_id", { length: 32 }).notNull().unique(),
  websiteStatus: varchar("website_status", { length: 32 }).notNull().default("unknown"),
  googleBusinessProfile: varchar("google_business_profile", { length: 1024 }),
  facebook: varchar("facebook", { length: 1024 }),
  instagram: varchar("instagram", { length: 1024 }),
  linkedin: varchar("linkedin", { length: 1024 }),
  hasWebsite: int("has_website").notNull().default(0),
  sslEnabled: int("ssl_enabled"),
  mobileFriendly: int("mobile_friendly"),
  pageSpeedScore: int("page_speed_score"),
  hasContactForm: int("has_contact_form"),
  hasBookingFlow: int("has_booking_flow"),
  hasChatWidget: int("has_chat_widget"),
  hasMetaPixel: int("has_meta_pixel"),
  hasGoogleAnalytics: int("has_google_analytics"),
  ecommercePlatform: varchar("ecommerce_platform", { length: 128 }),
  crmDetected: varchar("crm_detected", { length: 128 }),
  emailProvider: varchar("email_provider", { length: 128 }),
  techStackJson: text("tech_stack_json"),
  finalUrl: text("final_url"),
  summary: text("summary"),
  socialPresence: text("social_presence"),
  estimatedMonthlyOrders: varchar("estimated_monthly_orders", { length: 64 }),
  enrichedAt: timestamp("enriched_at").defaultNow().notNull(),
}, t => [index("idx_lead_engine_enrichment_status").on(t.websiteStatus)]);

export const leadEngineScoringEvents = mysqlTable(
  "lead_engine_scoring_events",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    scoreChange: int("score_change").notNull(),
    reason: text("reason").notNull(),
    ruleKey: varchar("rule_key", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  t => [index("idx_lead_engine_score_lead").on(t.leadId)]
);

export const leadEngineOutreachEvents = mysqlTable(
  "lead_engine_outreach_events",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    channel: varchar("channel", { length: 32 }).notNull(),
    direction: varchar("direction", { length: 16 }).notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    subject: text("subject"),
    messagePreview: text("message_preview"),
    sentBy: varchar("sent_by", { length: 64 }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    replyAt: timestamp("reply_at"),
    status: varchar("status", { length: 32 }),
    externalMessageId: varchar("external_message_id", { length: 128 }),
  },
  t => [index("idx_lead_engine_outreach_lead").on(t.leadId)]
);

export const leadEngineImportBatches = mysqlTable("lead_engine_import_batches", {
  id: varchar("id", { length: 32 }).primaryKey(),
  sourceName: varchar("source_name", { length: 128 }).notNull().default("csv"),
  fileName: varchar("file_name", { length: 512 }),
  status: mysqlEnum("status", leadEngineImportBatchStatuses).notNull().default("pending"),
  totalRows: int("total_rows").notNull().default(0),
  insertedRows: int("inserted_rows").notNull().default(0),
  updatedRows: int("updated_rows").notNull().default(0),
  duplicateRows: int("duplicate_rows").notNull().default(0),
  failedRows: int("failed_rows").notNull().default(0),
  errorLog: text("error_log"),
  linkedLeadIdsJson: text("linked_lead_ids_json"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const leadEngineAgentQueues = mysqlTable(
  "lead_engine_agent_queues",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    assignedAgent: varchar("assigned_agent", { length: 32 }).notNull(),
    queueStatus: mysqlEnum("queue_status", leadEngineAgentQueueStatuses).notNull().default("pending"),
    reason: text("reason"),
    scheduledFor: timestamp("scheduled_for"),
    completedAt: timestamp("completed_at"),
  },
  t => [index("idx_lead_engine_aq_lead").on(t.leadId)]
);

export const leadEnginePipelineEvents = mysqlTable(
  "lead_engine_pipeline_events",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    fromStage: varchar("from_stage", { length: 32 }),
    toStage: varchar("to_stage", { length: 32 }).notNull(),
    at: timestamp("at").defaultNow().notNull(),
    actor: varchar("actor", { length: 64 }).notNull().default("system"),
    note: text("note"),
  },
  t => [index("idx_lead_engine_pe_lead").on(t.leadId)]
);

export const leadEngineActivityLog = mysqlTable(
  "lead_engine_activity_log",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    leadId: varchar("lead_id", { length: 32 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    message: text("message").notNull(),
    at: timestamp("at").defaultNow().notNull(),
    actor: varchar("actor", { length: 64 }).notNull().default("system"),
  },
  t => [index("idx_lead_engine_act_lead").on(t.leadId)]
);

export type LeadEngineLeadRow = typeof leadEngineLeads.$inferSelect;
export type LeadEngineEnrichmentRow = typeof leadEngineEnrichment.$inferSelect;
