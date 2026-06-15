CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `documents_tag_idx` ON `documents` (`tag`);--> statement-breakpoint
CREATE INDEX `documents_published_at_idx` ON `documents` (`published_at`);--> statement-breakpoint
CREATE INDEX `messages_user_id_idx` ON `messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `questions_subject_code_idx` ON `questions` (`subject_code`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `submissions_subject_code_idx` ON `submissions` (`subject_code`);