import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

let sqlite: SQLiteDatabase | undefined;
let instance: ReturnType<typeof createDb> | undefined;

function createDb() {
  sqlite = openDatabaseSync('bodytrack.db', { enableChangeListener: true });
  return drizzle(sqlite, { schema });
}

/**
 * The app's database, opened lazily on first use.
 * Never call this at module load: on web, SQLite runs in a Web Worker that must be started first (see prepareDatabase).
 */
export function getDb() {
  return (instance ??= createDb());
}

/** The raw expo-sqlite database (for dev tools like Drizzle Studio). Opens it if needed. */
export function getSqlite(): SQLiteDatabase {
  getDb();
  return sqlite!;
}

/**
 * On web, synchronous SQLite calls block the main thread while waiting for the worker, and the very first call
 * (which loads the WebAssembly) can exceed the wait limit. One async call first starts the worker safely.
 */
export async function prepareDatabase() {
  if (Platform.OS === 'web') {
    const warmUp = await openDatabaseAsync(':memory:');
    await warmUp.closeAsync();
  }
  return getDb();
}
