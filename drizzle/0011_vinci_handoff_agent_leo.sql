-- Internal agent id is `leo` (not a Telegram @handle / not an OpenClaw session label).
UPDATE `vinci_handoffs` SET `assigned_to` = 'leo' WHERE `assigned_to` = 'Leo';
ALTER TABLE `vinci_handoffs` MODIFY COLUMN `assigned_to` varchar(64) NOT NULL DEFAULT 'leo';
