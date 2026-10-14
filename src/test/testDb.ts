import * as schema from '@/shared/db/schema';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

/** A fresh, fully migrated in-memory database. Call it in beforeEach so tests never share data. */
export function createTestDb() {
  const db = drizzle(new Database(':memory:'), { schema });
  migrate(db, { migrationsFolder: 'drizzle' }); // the SAME migration files the app uses
  return db;
}
