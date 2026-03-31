ALTER TABLE `lead_engine_leads`
  ADD COLUMN `target_zip` varchar(32) NULL,
  ADD COLUMN `radius_miles` int NULL,
  ADD COLUMN `contacted_at` timestamp NULL,
  ADD COLUMN `follow_up_at` timestamp NULL,
  ADD COLUMN `outreach_prep` text NULL;

ALTER TABLE `lead_engine_enrichment`
  ADD COLUMN `google_business_profile` varchar(1024) NULL,
  ADD COLUMN `facebook` varchar(1024) NULL,
  ADD COLUMN `instagram` varchar(1024) NULL,
  ADD COLUMN `linkedin` varchar(1024) NULL;
