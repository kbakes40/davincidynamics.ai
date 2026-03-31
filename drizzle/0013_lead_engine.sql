-- Lead Engine (separate from public `leads` website captures).
CREATE TABLE `lead_engine_leads` (
  `id` varchar(32) NOT NULL,
  `business_name` text NOT NULL,
  `owner_name` text,
  `category` varchar(255) NOT NULL DEFAULT '',
  `subcategory` varchar(255),
  `source` varchar(255) NOT NULL DEFAULT 'import',
  `source_record_id` varchar(255),
  `lead_status` enum('new','enriched','validated','qualified','unqualified','archived') NOT NULL DEFAULT 'new',
  `outreach_status` enum('not_contacted','queued','contacted','replied','follow_up_needed','interested','meeting_booked','won','lost','do_not_contact') NOT NULL DEFAULT 'not_contacted',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'low',
  `score` int NOT NULL DEFAULT 0,
  `score_reason` text,
  `notes_json` text,
  `reason_codes_json` text,
  `tags_json` text,
  `pipeline_stage` enum('new_lead','verified','site_reviewed','outreach_ready','contacted','follow_up','closed_won','closed_lost') NOT NULL DEFAULT 'new_lead',
  `verification_status` enum('unverified','pending','verified','failed') NOT NULL DEFAULT 'unverified',
  `assigned_owner` varchar(64),
  `source_job_id` varchar(64),
  `normalized_business_name` varchar(512) NOT NULL DEFAULT '',
  `normalized_phone` varchar(64),
  `normalized_website` varchar(512),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `last_verified_at` timestamp,
  CONSTRAINT `lead_engine_leads_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_norm_phone` ON `lead_engine_leads` (`normalized_phone`);
CREATE INDEX `idx_lead_engine_norm_site` ON `lead_engine_leads` (`normalized_website`);
CREATE INDEX `idx_lead_engine_norm_name` ON `lead_engine_leads` (`normalized_business_name`);
CREATE INDEX `idx_lead_engine_pipeline` ON `lead_engine_leads` (`pipeline_stage`);
CREATE INDEX `idx_lead_engine_score` ON `lead_engine_leads` (`score`);

CREATE TABLE `lead_engine_contact_points` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `type` enum('phone','email','website','instagram','facebook','linkedin','other') NOT NULL,
  `value` text NOT NULL,
  `is_primary` int NOT NULL DEFAULT 1,
  `is_verified` int NOT NULL DEFAULT 0,
  `verification_status` varchar(32) NOT NULL DEFAULT 'unknown',
  `source` varchar(64) NOT NULL DEFAULT 'import',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `lead_engine_contact_points_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_cp_lead` ON `lead_engine_contact_points` (`lead_id`);

CREATE TABLE `lead_engine_addresses` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `address_1` text,
  `city` varchar(128) NOT NULL DEFAULT '',
  `state` varchar(64) NOT NULL DEFAULT '',
  `zip` varchar(32),
  `country` varchar(64) NOT NULL DEFAULT 'US',
  `latitude` decimal(10,7),
  `longitude` decimal(10,7),
  `service_radius_miles` int,
  CONSTRAINT `lead_engine_addresses_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_addr_lead` ON `lead_engine_addresses` (`lead_id`);

CREATE TABLE `lead_engine_sources` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `source_name` varchar(128) NOT NULL,
  `source_type` varchar(64) NOT NULL DEFAULT 'csv',
  `import_batch_id` varchar(32),
  `raw_payload_json` text,
  `source_url` varchar(1024),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `lead_engine_sources_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_src_lead` ON `lead_engine_sources` (`lead_id`);
CREATE INDEX `idx_lead_engine_src_batch` ON `lead_engine_sources` (`import_batch_id`);

CREATE TABLE `lead_engine_enrichment` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `website_status` varchar(32) NOT NULL DEFAULT 'unknown',
  `has_website` int NOT NULL DEFAULT 0,
  `ssl_enabled` int,
  `mobile_friendly` int,
  `page_speed_score` int,
  `has_contact_form` int,
  `has_booking_flow` int,
  `has_chat_widget` int,
  `has_meta_pixel` int,
  `has_google_analytics` int,
  `ecommerce_platform` varchar(128),
  `crm_detected` varchar(128),
  `email_provider` varchar(128),
  `tech_stack_json` text,
  `summary` text,
  `social_presence` text,
  `estimated_monthly_orders` varchar(64),
  `enriched_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `lead_engine_enrichment_id` PRIMARY KEY(`id`),
  CONSTRAINT `lead_engine_enrichment_lead_id_unique` UNIQUE(`lead_id`)
);

CREATE TABLE `lead_engine_scoring_events` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `score_change` int NOT NULL,
  `reason` text NOT NULL,
  `rule_key` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `lead_engine_scoring_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_score_lead` ON `lead_engine_scoring_events` (`lead_id`);

CREATE TABLE `lead_engine_outreach_events` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `direction` varchar(16) NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `subject` text,
  `message_preview` text,
  `sent_by` varchar(64),
  `sent_at` timestamp NOT NULL DEFAULT (now()),
  `reply_at` timestamp,
  `status` varchar(32),
  `external_message_id` varchar(128),
  CONSTRAINT `lead_engine_outreach_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_outreach_lead` ON `lead_engine_outreach_events` (`lead_id`);

CREATE TABLE `lead_engine_import_batches` (
  `id` varchar(32) NOT NULL,
  `source_name` varchar(128) NOT NULL DEFAULT 'csv',
  `file_name` varchar(512),
  `status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `total_rows` int NOT NULL DEFAULT 0,
  `inserted_rows` int NOT NULL DEFAULT 0,
  `updated_rows` int NOT NULL DEFAULT 0,
  `duplicate_rows` int NOT NULL DEFAULT 0,
  `failed_rows` int NOT NULL DEFAULT 0,
  `error_log` text,
  `linked_lead_ids_json` text,
  `started_at` timestamp NOT NULL DEFAULT (now()),
  `completed_at` timestamp,
  CONSTRAINT `lead_engine_import_batches_id` PRIMARY KEY(`id`)
);

CREATE TABLE `lead_engine_agent_queues` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `assigned_agent` varchar(32) NOT NULL,
  `queue_status` enum('pending','active','completed','skipped') NOT NULL DEFAULT 'pending',
  `reason` text,
  `scheduled_for` timestamp,
  `completed_at` timestamp,
  CONSTRAINT `lead_engine_agent_queues_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_aq_lead` ON `lead_engine_agent_queues` (`lead_id`);

CREATE TABLE `lead_engine_pipeline_events` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `from_stage` varchar(32),
  `to_stage` varchar(32) NOT NULL,
  `at` timestamp NOT NULL DEFAULT (now()),
  `actor` varchar(64) NOT NULL DEFAULT 'system',
  `note` text,
  CONSTRAINT `lead_engine_pipeline_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_pe_lead` ON `lead_engine_pipeline_events` (`lead_id`);

CREATE TABLE `lead_engine_activity_log` (
  `id` varchar(32) NOT NULL,
  `lead_id` varchar(32) NOT NULL,
  `type` varchar(32) NOT NULL,
  `message` text NOT NULL,
  `at` timestamp NOT NULL DEFAULT (now()),
  `actor` varchar(64) NOT NULL DEFAULT 'system',
  CONSTRAINT `lead_engine_activity_log_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lead_engine_act_lead` ON `lead_engine_activity_log` (`lead_id`);
