-- Google Maps URL on lead row; final URL after redirects on enrichment.
ALTER TABLE `lead_engine_leads`
  ADD COLUMN `google_maps_url` varchar(1024) NULL AFTER `source_job_id`;

ALTER TABLE `lead_engine_enrichment`
  ADD COLUMN `final_url` text NULL AFTER `tech_stack_json`;

CREATE INDEX `idx_lead_engine_source_record_id` ON `lead_engine_leads` (`source_record_id`);
CREATE INDEX `idx_lead_engine_priority` ON `lead_engine_leads` (`priority`);
CREATE INDEX `idx_lead_engine_source` ON `lead_engine_leads` (`source`);
CREATE INDEX `idx_lead_engine_enrichment_status` ON `lead_engine_enrichment` (`website_status`);
