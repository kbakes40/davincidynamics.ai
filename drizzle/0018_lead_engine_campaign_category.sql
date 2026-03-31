ALTER TABLE lead_engine_campaigns ADD COLUMN category varchar(128);
CREATE INDEX idx_le_campaign_category ON lead_engine_campaigns (category);
