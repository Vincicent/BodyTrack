import { AppText, Card } from '@/shared/ui';
import { useTheme } from '@/shared/theme/useTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';
import { selectCrashReports, setCrashReports } from '../settingsSlice';

/** Opt-out of anonymous crash reports. The app layer starts or stops Sentry when this changes. */
export function PrivacySection() {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const enabled = useAppSelector(selectCrashReports);
  return (
    <Card title={t('privacy.title')}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        <AppText style={{ flex: 1 }}>{t('privacy.crashReports')}</AppText>
        <Switch
          accessibilityLabel={t('privacy.crashReports')}
          accessibilityHint={t('privacy.crashReportsHelp')}
          value={enabled}
          onValueChange={(v) => void dispatch(setCrashReports(v))}
          trackColor={{ true: theme.colors.primary }}
        />
      </View>
      <AppText variant="caption">{t('privacy.crashReportsHelp')}</AppText>
    </Card>
  );
}
