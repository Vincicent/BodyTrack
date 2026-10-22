import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { createTestDb } from '@/test/testDb';
import { measurementEntries } from './schema';

/** Runs one migration file's statements on a database, the way Drizzle splits them. */
function runMigration(db: Database.Database, file: string) {
  readFileSync(`drizzle/${file}`, 'utf8')
    .split('--> statement-breakpoint')
    .forEach((statement) => db.exec(statement));
}

describe('migration 0002: calf → left and right calves', () => {
  it('copies each old calf value to both calves, keeping its date, value and note', () => {
    const db = createTestDb(); // all migrations applied: the table exists
    const sqlite = db.$client;
    // Data as an older app version saved it, before 0002
    const insert = sqlite.prepare(
      'INSERT INTO measurement_entries (measured_at, site, value_cm, note, created_at) VALUES (?, ?, ?, ?, ?)',
    );
    insert.run(1_000, 'calf', 37, 'after run', 1_000);
    insert.run(2_000, 'calf', 36.5, null, 2_000);
    insert.run(2_000, 'waist', 82, null, 2_000);

    runMigration(sqlite, '0002_split_calf_left_right.sql');

    const rows = db.select().from(measurementEntries).all();
    const by = (site: string) =>
      rows
        .filter((r) => r.site === site)
        .map((r) => [r.measuredAt.getTime(), r.valueCm, r.note])
        .sort();
    expect(by('calfL')).toEqual([
      [1000, 37, 'after run'],
      [2000, 36.5, null],
    ]);
    expect(by('calfR')).toEqual(by('calfL'));
    expect(rows.filter((r) => (r.site as string) === 'calf')).toHaveLength(0);
    expect(by('waist')).toEqual([[2000, 82, null]]); // other sites untouched
  });

  it('does nothing on a database without calf values', () => {
    const db = createTestDb();
    db.insert(measurementEntries)
      .values({ measuredAt: new Date(1_000), site: 'waist', valueCm: 82 })
      .run();
    runMigration(db.$client, '0002_split_calf_left_right.sql');
    expect(db.select().from(measurementEntries).all()).toHaveLength(1);
  });
});
