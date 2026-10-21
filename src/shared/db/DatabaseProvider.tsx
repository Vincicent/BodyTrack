import { AppText, Screen } from '@/shared/ui';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import migrations from '../../../drizzle/migrations';
import { getDb, prepareDatabase } from './client';

void SplashScreen.preventAutoHideAsync(); // keep the native splash until the database is ready

function Migrations({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(getDb(), migrations);
  useEffect(() => {
    if (success || error) SplashScreen.hide();
  }, [success, error]);
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
  if (!ready) return null; // the native splash screen is still visible
  return <Migrations>{children}</Migrations>;
}
