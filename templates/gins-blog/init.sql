CREATE TABLE `music` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`url` text NOT NULL,
	`cover` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`github_id` integer,
	`username` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`content` text NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`comment_id` text,
	`post_id` text,
	`value` integer NOT NULL,
	PRIMARY KEY(`user_id`, `comment_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `google_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `discord_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `social_links` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);
ALTER TABLE `sessions` ADD `user_agent` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `ip_address` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `created_at` integer;--> statement-breakpoint
ALTER TABLE `sessions` ADD `last_active` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `github_username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `github_avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `google_username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `google_avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `discord_username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `discord_avatar` text;
ALTER TABLE `sessions` ADD `country` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `city` text;
ALTER TABLE `posts` ADD `views` integer DEFAULT 0 NOT NULL;
ALTER TABLE `users` ADD `created_at` integer;--> statement-breakpoint

-- Backfill the creator account from the earliest known session timestamp when possible
UPDATE `users`
SET `created_at` = (
	SELECT MIN(`sessions`.`created_at`)
	FROM `sessions`
	WHERE `sessions`.`user_id` = `users`.`id`
)
WHERE `created_at` IS NULL
  AND (
	lower(COALESCE(`users`.`username`, '')) IN ('ichimarugin', 'ichimarugin728', 'gin ichimaru')
	OR lower(COALESCE(`users`.`github_username`, '')) IN ('ichimarugin', 'ichimarugin728', 'gin ichimaru')
	OR lower(COALESCE(`users`.`google_username`, '')) IN ('ichimarugin', 'ichimarugin728', 'gin ichimaru')
	OR lower(COALESCE(`users`.`discord_username`, '')) IN ('ichimarugin', 'ichimarugin728', 'gin ichimaru')
  );--> statement-breakpoint

-- Backfill all other historical users to Jan 31, 2026 (Asia/Singapore midnight)
UPDATE `users`
SET `created_at` = 1769788800000
WHERE `created_at` IS NULL;
