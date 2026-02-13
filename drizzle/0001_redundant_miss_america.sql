CREATE TABLE `bot_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` varchar(64) NOT NULL,
	`username` varchar(255),
	`first_name` varchar(255),
	`last_name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_active` timestamp NOT NULL DEFAULT (now()),
	`business_type` varchar(100),
	`monthly_revenue` varchar(50),
	`current_platform` varchar(100),
	`pain_points` text,
	`lead_score` int DEFAULT 0,
	`status` varchar(50) DEFAULT 'new',
	`language` varchar(10) DEFAULT 'en',
	`timezone` varchar(50),
	`opted_out` int DEFAULT 0,
	CONSTRAINT `bot_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_users_telegram_user_id_unique` UNIQUE(`telegram_user_id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`ended_at` timestamp,
	`message_count` int DEFAULT 0,
	`lead_score_change` int DEFAULT 0,
	`outcome` varchar(50),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`event_data` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`tokens_used` int,
	`response_time_ms` int,
	`intent` varchar(100),
	`sentiment` varchar(20),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
