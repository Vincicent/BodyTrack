import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from './schema';

// Any synchronous SQLite Drizzle DB with our schema: expo-sqlite in the app, better-sqlite3 in tests.
export type AppDatabase = BaseSQLiteDatabase<'sync', any, typeof schema>;
