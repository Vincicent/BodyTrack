import { selectCrashReports, selectLanguage, selectTheme } from '@/features/settings';
import { configureNotifications } from '@/features/settings/reminders';
import { useNotificationRouting } from '@/features/settings/useNotificationRouting';
import { DatabaseProvider } from '@/shared/db/DatabaseProvider';
import { setCrashReporting } from '@/shared/lib/crashReporting';
import { deviceLanguage, i18n } from '@/shared/lib/i18n'; // importing it initialises translations
import { ThemePreferenceProvider } from '@/shared/theme/ThemePreference';
import { useColorSchemeName } from '@/shared/theme/useTheme';
import { ErrorScreen } from '@/shared/ui';
import { AnimatedSplash } from '@/shared/ui/AnimatedSplash';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  type ErrorBoundaryProps,
} from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

/** App layer: reads preferences from the store and hands them to `shared/` (which never imports the store). */
function PreferencesBridge({ children }: { children: ReactNode }) {
  const theme = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);
  const crashReports = useAppSelector(selectCrashReports);
  // After rehydration, so a user who opted out never has Sentry started, even briefly
  useEffect(() => setCrashReporting(crashReports), [crashReports]);
  useEffect(() => {
    void i18n.changeLanguage(language === 'system' ? deviceLanguage() : language);
  }, [language]);
  return <ThemePreferenceProvider value={theme}>{children}</ThemePreferenceProvider>;
}

configureNotifications();

function Navigation() {
  const { t } = useTranslation();
  useNotificationRouting();
  const isDark = useColorSchemeName() === 'dark';
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {/* minimal: only the back arrow (otherwise iOS shows the route group's name, "(tabs)") */}
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry/new"
          options={{ presentation: 'modal', title: t('entry.addTitle') }}
        />
        <Stack.Screen name="entry/[id]" options={{ title: t('entry.detailsTitle') }} />
        <Stack.Screen name="entry/edit/[id]" options={{ title: t('entry.editTitle') }} />
        <Stack.Screen
          name="measurement/new"
          options={{ presentation: 'modal', title: t('measurement.addTitle') }}
        />
        <Stack.Screen
          name="measurement/edit/[id]"
          options={{ title: t('measurement.editTitle') }}
        />
      </Stack>
    </ThemeProvider>
  );
}

/** Expo Router renders this instead of the layout when anything below throws. */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorScreen {...props} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PreferencesBridge>
            <KeyboardProvider>
              <DatabaseProvider>
                <Navigation />
                {/* Mounted with the app, when the native splash hides: takes its place, then animates out */}
                <AnimatedSplash />
              </DatabaseProvider>
            </KeyboardProvider>
          </PreferencesBridge>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
