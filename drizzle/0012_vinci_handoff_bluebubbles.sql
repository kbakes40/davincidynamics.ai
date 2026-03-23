-- BlueBubbles / Kevin follow-up tracking (internal; not customer-facing Telegram handoff).
ALTER TABLE `vinci_handoffs`
  ADD COLUMN `followup_channel` varchar(32) NULL AFTER `contact_captured`,
  ADD COLUMN `bluebubbles_sent_at` timestamp NULL AFTER `followup_channel`,
  ADD COLUMN `bluebubbles_status` varchar(32) NULL DEFAULT 'pending' AFTER `bluebubbles_sent_at`,
  ADD COLUMN `bluebubbles_message_id` varchar(128) NULL AFTER `bluebubbles_status`,
  ADD COLUMN `invalid_phone` int NOT NULL DEFAULT 0 AFTER `bluebubbles_message_id`;
