-- Drop old documents table and recreate with new schema
DROP TABLE IF EXISTS `documents`;
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tag` text NOT NULL,
	`file_url` text NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_slug_unique` ON `documents` (`slug`);
