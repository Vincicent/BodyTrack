import { getDb } from '@/shared/db/client';
import { weightEntries } from '@/shared/db/schema';
import type { AppDatabase } from '@/shared/db/types';
import { desc, eq } from 'drizzle-orm';
import type { NewWeightEntry } from '../domain/weight';

/** `db` is a function so the database is opened lazily, at call time (and so tests can pass their own). */
export function createWeightRepository(db: () => AppDatabase) {
  return {
    listQuery: () => db().select().from(weightEntries).orderBy(desc(weightEntries.measuredAt)),
    getById: (id: number) =>
      db().select().from(weightEntries).where(eq(weightEntries.id, id)).get(),
    add: (entry: NewWeightEntry) => db().insert(weightEntries).values(entry).returning().get(),
    update: (id: number, patch: Partial<NewWeightEntry>) =>
      db().update(weightEntries).set(patch).where(eq(weightEntries.id, id)).run(),
    remove: (id: number) => db().delete(weightEntries).where(eq(weightEntries.id, id)).run(),
    addMany: (entries: NewWeightEntry[]) =>
      db().transaction((tx) => entries.map((e) => tx.insert(weightEntries).values(e).run())),
    removeAll: () => db().delete(weightEntries).run(),
  };
}

export const weightRepository = createWeightRepository(getDb);
