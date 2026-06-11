-- Make tag column nullable (recreate table since SQLite doesn't support DROP NOT NULL)
CREATE TABLE `documents_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tag` text,
	`file_url` text NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
INSERT INTO `documents_new` SELECT `id`, `slug`, `title`, `description`, `tag`, `file_url`, `download_count`, `published_at`, `created_at` FROM `documents`;
--> statement-breakpoint
DROP TABLE `documents`;
--> statement-breakpoint
ALTER TABLE `documents_new` RENAME TO `documents`;
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_slug_unique` ON `documents` (`slug`);
