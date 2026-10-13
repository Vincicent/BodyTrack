import '@/shared/lib/i18n'; // initialise translations before anything renders
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
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
