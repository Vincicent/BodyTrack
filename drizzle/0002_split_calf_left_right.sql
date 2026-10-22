-- "calf" had no side. It is now measured left and right: each old calf value becomes both (the two calves assumed
-- equal), so both histories start with the user's data. The copy keeps the date, value, note and creation time.
INSERT INTO `measurement_entries` (`measured_at`, `site`, `value_cm`, `note`, `created_at`)
SELECT `measured_at`, 'calfL', `value_cm`, `note`, `created_at` FROM `measurement_entries` WHERE `site` = 'calf';
--> statement-breakpoint
UPDATE `measurement_entries` SET `site` = 'calfR' WHERE `site` = 'calf';
