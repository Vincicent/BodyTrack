import { selectLanguage, selectTheme } from '@/features/settings';
import { DatabaseProvider } from '@/shared/db/DatabaseProvider';
import { deviceLanguage, i18n } from '@/shared/lib/i18n'; // importing it initialises translations
import { ThemePreferenceProvider } from '@/shared/theme/ThemePreference';
import { useColorSchemeName } from '@/shared/theme/useTheme';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
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
  useEffect(() => {
    void i18n.changeLanguage(language === 'system' ? deviceLanguage() : language);
  }, [language]);
  return <ThemePreferenceProvider value={theme}>{children}</ThemePreferenceProvider>;
}

function Navigation() {
  const { t } = useTranslation();
  const isDark = useColorSchemeName() === 'dark';
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry/new"
          options={{ presentation: 'modal', title: t('entry.addTitle') }}
        />
        <Stack.Screen name="entry/[id]" options={{ title: t('entry.editTitle') }} />
        <Stack.Screen
          name="measurement/new"
          options={{ presentation: 'modal', title: t('measurement.addTitle') }}
        />
      </Stack>
    </ThemeProvider>
  );
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
              </DatabaseProvider>
            </KeyboardProvider>
          </PreferencesBridge>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
