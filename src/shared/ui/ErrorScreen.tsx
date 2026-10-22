import { reportError } from '@/shared/lib/crashReporting';
import { useTheme } from '@/shared/theme/useTheme';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = { error: Error; retry: () => void | Promise<void> };

/** Friendly screen for Expo Router's ErrorBoundary export. */
export function ErrorScreen({ error, retry }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  useEffect(() => reportError(error), [error]); // the app caught it, but it is still a bug worth knowing about
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.background,
      }}
    >
      <AppText variant="title" accessibilityRole="header">
        {t('error.title')}
      </AppText>
      <AppText variant="caption">{error.message}</AppText>
      <Button title={t('error.retry')} onPress={() => void retry()} />
    </View>
  );
}
