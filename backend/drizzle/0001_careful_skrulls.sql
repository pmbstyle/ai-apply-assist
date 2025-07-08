ALTER TABLE opportunities ADD `salary_from` integer;--> statement-breakpoint
ALTER TABLE opportunities ADD `salary_to` integer;--> statement-breakpoint
ALTER TABLE opportunities ADD `salary_na` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE opportunities ADD `notes` text;--> statement-breakpoint
ALTER TABLE `opportunities` DROP COLUMN `salary`;