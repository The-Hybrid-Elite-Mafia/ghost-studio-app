CREATE TABLE `genres` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `station` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`genre` text NOT NULL,
	`status` text NOT NULL,
	`uploader` text NOT NULL,
	`audio_key` text NOT NULL,
	`cover_key` text,
	`mime` text NOT NULL,
	`bytes` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tracks_status_created` ON `tracks` (`status`,`created`);--> statement-breakpoint
CREATE INDEX `idx_tracks_uploader_created` ON `tracks` (`uploader`,`created`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`size` integer NOT NULL,
	`content_type` text NOT NULL,
	`created` integer NOT NULL,
	`state` text DEFAULT 'uploading' NOT NULL,
	`result` text,
	`progress` text,
	`updated` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_uploads_user` ON `uploads` (`user`);