-- Lead Engine on PostgreSQL (Supabase). Run once in SQL Editor.
-- Matches `drizzle/leadEnginePgSchema.ts` / `drizzle/leadEngineConstants.ts`.

CREATE TYPE lead_engine_lead_status AS ENUM (
  'new', 'enriched', 'validated', 'qualified', 'unqualified', 'archived'
);
CREATE TYPE lead_engine_outreach_status AS ENUM (
  'new', 'researched', 'drafted', 'ready_to_send', 'sent', 'replied',
  'interested', 'not_interested', 'follow_up_needed'
);
CREATE TYPE lead_engine_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE lead_engine_pipeline_stage AS ENUM (
  'new_lead', 'verified', 'site_reviewed', 'outreach_ready',
  'contacted', 'follow_up', 'closed_won', 'closed_lost'
);
CREATE TYPE lead_engine_verification_status AS ENUM (
  'unverified', 'pending', 'verified', 'failed'
);
CREATE TYPE lead_engine_import_batch_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'cancelled'
);
CREATE TYPE lead_engine_contact_point_type AS ENUM (
  'phone', 'email', 'website', 'instagram', 'facebook', 'linkedin', 'other'
);
CREATE TYPE lead_engine_agent_queue_status AS ENUM (
  'pending', 'active', 'completed', 'skipped'
);

CREATE TABLE lead_engine_leads (
  id varchar(32) PRIMARY KEY,
  business_name text NOT NULL,
  owner_name text,
  category varchar(255) NOT NULL DEFAULT '',
  subcategory varchar(255),
  source varchar(255) NOT NULL DEFAULT 'import',
  source_record_id varchar(255),
  target_zip varchar(32),
  radius_miles integer,
  contacted_at timestamptz,
  follow_up_at timestamptz,
  outreach_prep text,
  lead_status lead_engine_lead_status NOT NULL DEFAULT 'new',
  outreach_status lead_engine_outreach_status NOT NULL DEFAULT 'new',
  priority lead_engine_priority NOT NULL DEFAULT 'low',
  score integer NOT NULL DEFAULT 0,
  score_reason text,
  notes_json text,
  reason_codes_json text,
  tags_json text,
  pipeline_stage lead_engine_pipeline_stage NOT NULL DEFAULT 'new_lead',
  verification_status lead_engine_verification_status NOT NULL DEFAULT 'unverified',
  assigned_owner varchar(64),
  source_job_id varchar(64),
  google_maps_url varchar(1024),
  normalized_business_name varchar(512) NOT NULL DEFAULT '',
  normalized_phone varchar(64),
  normalized_website varchar(512),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz
);

CREATE INDEX idx_lead_engine_norm_phone ON lead_engine_leads (normalized_phone);
CREATE INDEX idx_lead_engine_norm_site ON lead_engine_leads (normalized_website);
CREATE INDEX idx_lead_engine_norm_name ON lead_engine_leads (normalized_business_name);
CREATE INDEX idx_lead_engine_pipeline ON lead_engine_leads (pipeline_stage);
CREATE INDEX idx_lead_engine_score ON lead_engine_leads (score);
CREATE INDEX idx_lead_engine_source_record_id ON lead_engine_leads (source_record_id);
CREATE INDEX idx_lead_engine_priority ON lead_engine_leads (priority);
CREATE INDEX idx_lead_engine_source ON lead_engine_leads (source);

CREATE TABLE lead_engine_contact_points (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  type lead_engine_contact_point_type NOT NULL,
  value text NOT NULL,
  is_primary integer NOT NULL DEFAULT 1,
  is_verified integer NOT NULL DEFAULT 0,
  verification_status varchar(32) NOT NULL DEFAULT 'unknown',
  source varchar(64) NOT NULL DEFAULT 'import',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_engine_cp_lead ON lead_engine_contact_points (lead_id);

CREATE TABLE lead_engine_addresses (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  address_1 text,
  city varchar(128) NOT NULL DEFAULT '',
  state varchar(64) NOT NULL DEFAULT '',
  zip varchar(32),
  country varchar(64) NOT NULL DEFAULT 'US',
  latitude numeric(10,7),
  longitude numeric(10,7),
  service_radius_miles integer
);
CREATE INDEX idx_lead_engine_addr_lead ON lead_engine_addresses (lead_id);

CREATE TABLE lead_engine_sources (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  source_name varchar(128) NOT NULL,
  source_type varchar(64) NOT NULL DEFAULT 'csv',
  import_batch_id varchar(32),
  raw_payload_json text,
  source_url varchar(1024),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_engine_src_lead ON lead_engine_sources (lead_id);
CREATE INDEX idx_lead_engine_src_batch ON lead_engine_sources (import_batch_id);

CREATE TABLE lead_engine_enrichment (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL UNIQUE,
  website_status varchar(32) NOT NULL DEFAULT 'unknown',
  google_business_profile varchar(1024),
  facebook varchar(1024),
  instagram varchar(1024),
  linkedin varchar(1024),
  has_website integer NOT NULL DEFAULT 0,
  ssl_enabled integer,
  mobile_friendly integer,
  page_speed_score integer,
  has_contact_form integer,
  has_booking_flow integer,
  has_chat_widget integer,
  has_meta_pixel integer,
  has_google_analytics integer,
  ecommerce_platform varchar(128),
  crm_detected varchar(128),
  email_provider varchar(128),
  tech_stack_json text,
  final_url text,
  summary text,
  social_presence text,
  estimated_monthly_orders varchar(64),
  enriched_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_engine_enrichment_status ON lead_engine_enrichment (website_status);

CREATE TABLE lead_engine_scoring_events (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  score_change integer NOT NULL,
  reason text NOT NULL,
  rule_key varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_engine_score_lead ON lead_engine_scoring_events (lead_id);

CREATE TABLE lead_engine_outreach_events (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  channel varchar(32) NOT NULL,
  direction varchar(16) NOT NULL,
  event_type varchar(64) NOT NULL,
  subject text,
  message_preview text,
  sent_by varchar(64),
  sent_at timestamptz NOT NULL DEFAULT now(),
  reply_at timestamptz,
  status varchar(32),
  external_message_id varchar(128)
);
CREATE INDEX idx_lead_engine_outreach_lead ON lead_engine_outreach_events (lead_id);

CREATE TABLE lead_engine_import_batches (
  id varchar(32) PRIMARY KEY,
  source_name varchar(128) NOT NULL DEFAULT 'csv',
  file_name varchar(512),
  status lead_engine_import_batch_status NOT NULL DEFAULT 'pending',
  total_rows integer NOT NULL DEFAULT 0,
  inserted_rows integer NOT NULL DEFAULT 0,
  updated_rows integer NOT NULL DEFAULT 0,
  duplicate_rows integer NOT NULL DEFAULT 0,
  failed_rows integer NOT NULL DEFAULT 0,
  error_log text,
  linked_lead_ids_json text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE lead_engine_agent_queues (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  assigned_agent varchar(32) NOT NULL,
  queue_status lead_engine_agent_queue_status NOT NULL DEFAULT 'pending',
  reason text,
  scheduled_for timestamptz,
  completed_at timestamptz
);
CREATE INDEX idx_lead_engine_aq_lead ON lead_engine_agent_queues (lead_id);

CREATE TABLE lead_engine_pipeline_events (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  from_stage varchar(32),
  to_stage varchar(32) NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  actor varchar(64) NOT NULL DEFAULT 'system',
  note text
);
CREATE INDEX idx_lead_engine_pe_lead ON lead_engine_pipeline_events (lead_id);

CREATE TABLE lead_engine_activity_log (
  id varchar(32) PRIMARY KEY,
  lead_id varchar(32) NOT NULL,
  type varchar(32) NOT NULL,
  message text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  actor varchar(64) NOT NULL DEFAULT 'system'
);
CREATE INDEX idx_lead_engine_act_lead ON lead_engine_activity_log (lead_id);

-- `updated_at` is set in application code on updates (matches previous behavior enough for this app).
