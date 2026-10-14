import { AppText, Screen } from '@/shared/ui';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useEffect, useState, type ReactNode } from 'react';
import migrations from '../../../drizzle/migrations';
import { getDb, getSqlite, prepareDatabase } from './client';

function Migrations({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(getDb(), migrations);
  useDrizzleStudio(getSqlite()); // dev tools only: the plugin does nothing in production builds
  if (error) {
    return (
      <Screen>
        <AppText>Database error: {error.message}</AppText>
      </Screen>
    );
  }
  if (!success) return null;
  return <>{children}</>;
}

/** Opens the database, runs pending migrations, then renders the app. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void prepareDatabase().then(() => setReady(true));
  }, []);
  if (!ready) return null;
  return <Migrations>{children}</Migrations>;
}
