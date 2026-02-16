CREATE TABLE `profit_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`industry` varchar(50) NOT NULL,
	`revenue` decimal(12,2) NOT NULL,
	`cogs` decimal(12,2) NOT NULL,
	`platform_cost` decimal(12,2) NOT NULL,
	`ad_spend` decimal(12,2) NOT NULL,
	`fulfillment_cost` decimal(12,2) NOT NULL,
	`other_costs` decimal(12,2) NOT NULL DEFAULT '0',
	`net_profit` decimal(12,2) NOT NULL,
	`profit_margin` decimal(5,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profit_tracking_id` PRIMARY KEY(`id`)
);
