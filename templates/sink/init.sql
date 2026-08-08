-- Sink D1 initialization SQL (combined from drizzle migrations 0000-0003)

CREATE TABLE IF NOT EXISTS `link_tombstones` (
	`slug` text PRIMARY KEY NOT NULL,
	`deleted_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `links` (
	`slug` text PRIMARY KEY NOT NULL,
	`id` text NOT NULL,
	`url` text NOT NULL,
	`comment` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expiration` integer,
	`title` text,
	`description` text,
	`image` text,
	`apple` text,
	`google` text,
	`cloaking` integer,
	`redirect_with_query` integer,
	`password` text,
	`unsafe` integer,
	`geo` text,
	`normalized_url` text NOT NULL,
	`effective_expires_at` integer
);

CREATE INDEX IF NOT EXISTS `links_created_at_slug_idx` ON `links` (`created_at`,`slug`);
CREATE INDEX IF NOT EXISTS `links_normalized_url_idx` ON `links` (`normalized_url`);
CREATE INDEX IF NOT EXISTS `links_id_idx` ON `links` (`id`);

CREATE TABLE IF NOT EXISTS `link_migration_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`expected_cursor` text,
	`scanned` integer DEFAULT 0 NOT NULL,
	`inserted` integer DEFAULT 0 NOT NULL,
	`skipped` integer DEFAULT 0 NOT NULL,
	`expired` integer DEFAULT 0 NOT NULL,
	`force` integer NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `tags` (
	`name` text PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS `link_tags` (
	`link_slug` text NOT NULL,
	`tag_name` text NOT NULL,
	PRIMARY KEY(`link_slug`, `tag_name`),
	FOREIGN KEY (`link_slug`) REFERENCES `links`(`slug`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `link_tags_tag_name_link_slug_idx` ON `link_tags` (`tag_name`,`link_slug`);
CREATE INDEX IF NOT EXISTS `links_created_at_desc_slug_idx` ON `links` ("created_at" desc,`slug`);
