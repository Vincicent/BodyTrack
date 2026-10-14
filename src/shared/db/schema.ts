import { MEASUREMENT_SITES } from '@/shared/lib/measurementSites';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const weightEntries = sqliteTable(
  'weight_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    measuredAt: integer('measured_at', { mode: 'timestamp_ms' }).notNull(),
    weightKg: real('weight_kg').notNull(),
    note: text('note'),
    photoUri: text('photo_uri'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('weight_measured_at_idx').on(t.measuredAt)],
);

export const measurementEntries = sqliteTable(
  'measurement_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    measuredAt: integer('measured_at', { mode: 'timestamp_ms' }).notNull(),
    site: text('site', { enum: MEASUREMENT_SITES }).notNull(),
    valueCm: real('value_cm').notNull(),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('measurement_site_date_idx').on(t.site, t.measuredAt)],
);
