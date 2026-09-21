CREATE TABLE `ghost_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`key_cipher` text,
	`key_iv` text,
	`updated_at` integer NOT NULL,
	`verified_at` integer,
	`blocked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ghost_locks` (
	`user_id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ghost_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`day` text NOT NULL,
	`reserved_nanos` integer NOT NULL,
	`actual_nanos` integer,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ghost_requests_user_day` ON `ghost_requests` (`user_id`,`day`);--> statement-breakpoint
CREATE TABLE `ghost_usage` (
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`spent_nanos` integer DEFAULT 0 NOT NULL,
	`held_nanos` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `month`)
);
