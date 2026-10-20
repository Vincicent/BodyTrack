import { getDb } from '@/shared/db/client';
import { measurementEntries } from '@/shared/db/schema';
import type { AppDatabase } from '@/shared/db/types';
import type { MeasurementSite } from '@/shared/lib/measurementSites';
import { desc, eq } from 'drizzle-orm';
import type { NewMeasurementEntry } from '../domain/measurement';

/** `db` is a function so the database is opened lazily, at call time (and so tests can pass their own). */
export function createMeasurementRepository(db: () => AppDatabase) {
  return {
    listQuery: (site?: MeasurementSite) => {
      const base = db().select().from(measurementEntries);
      return (site ? base.where(eq(measurementEntries.site, site)) : base).orderBy(
        desc(measurementEntries.measuredAt),
      );
    },
    addMany: (rows: NewMeasurementEntry[]) =>
      db().transaction((tx) =>
        rows.map((row) => tx.insert(measurementEntries).values(row).returning().get()),
      ),
    remove: (id: number) =>
      db().delete(measurementEntries).where(eq(measurementEntries.id, id)).run(),
    removeAll: () => db().delete(measurementEntries).run(),
  };
}

export const measurementRepository = createMeasurementRepository(getDb);
