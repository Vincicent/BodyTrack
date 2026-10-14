CREATE TABLE `measurement_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`measured_at` integer NOT NULL,
	`site` text NOT NULL,
	`value_cm` real NOT NULL,
	`note` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `measurement_site_date_idx` ON `measurement_entries` (`site`,`measured_at`);--> statement-breakpoint
CREATE TABLE `weight_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`measured_at` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`note` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weight_measured_at_idx` ON `weight_entries` (`measured_at`);