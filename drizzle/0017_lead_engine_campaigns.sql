CREATE TABLE lead_engine_campaigns (
  id varchar(32) PRIMARY KEY,
  campaign_name text NOT NULL,
  campaign_type varchar(64) NOT NULL DEFAULT 'outbound',
  target_audience text,
  channel varchar(32) NOT NULL DEFAULT 'email',
  objective text,
  status varchar(32) NOT NULL DEFAULT 'draft',
  owner varchar(64),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_le_campaign_status ON lead_engine_campaigns (status);
CREATE INDEX idx_le_campaign_channel ON lead_engine_campaigns (channel);

CREATE TABLE lead_engine_campaign_leads (
  id varchar(32) PRIMARY KEY,
  campaign_id varchar(32) NOT NULL,
  lead_id varchar(32) NOT NULL,
  pipeline_id varchar(32),
  stage varchar(32) NOT NULL DEFAULT 'new_lead',
  outreach_status varchar(32) NOT NULL DEFAULT 'not_started',
  assigned_to varchar(64),
  sequence_step integer NOT NULL DEFAULT 1,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_le_campaign_leads_campaign ON lead_engine_campaign_leads (campaign_id);
CREATE INDEX idx_le_campaign_leads_lead ON lead_engine_campaign_leads (lead_id);
CREATE UNIQUE INDEX uq_le_campaign_lead_pair ON lead_engine_campaign_leads (campaign_id, lead_id);
