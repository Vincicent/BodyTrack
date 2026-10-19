import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Card, SegmentedControl } from '@/shared/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  selectLanguage,
  selectLengthUnit,
  selectTheme,
  selectWeightUnit,
  setLanguage,
  setLengthUnit,
  setTheme,
  setWeightUnit,
} from '../settingsSlice';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.xs }}>
      <AppText variant="caption">{label}</AppText>
      {children}
    </View>
  );
}

export function SettingsForm() {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const weightUnit = useAppSelector(selectWeightUnit);
  const lengthUnit = useAppSelector(selectLengthUnit);
  const themePref = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Card title={t('settings.units')}>
        <Row label={t('settings.weightUnit')}>
          <SegmentedControl
            value={weightUnit}
            options={['kg', 'lb'] as const}
            onChange={(u) => dispatch(setWeightUnit(u))}
          />
        </Row>
        <Row label={t('settings.lengthUnit')}>
          <SegmentedControl
            value={lengthUnit}
            options={['cm', 'in'] as const}
            onChange={(u) => dispatch(setLengthUnit(u))}
          />
        </Row>
      </Card>
      <Card title={t('settings.appearance')}>
        <Row label={t('settings.theme')}>
          <SegmentedControl
            value={themePref}
            options={['system', 'light', 'dark'] as const}
            labels={{
              system: t('settings.themeSystem'),
              light: t('settings.themeLight'),
              dark: t('settings.themeDark'),
            }}
            onChange={(v) => dispatch(setTheme(v))}
          />
        </Row>
        <Row label={t('settings.language')}>
          <SegmentedControl
            value={language}
            options={['system', 'en', 'fr'] as const}
            labels={{ system: t('settings.languageSystem'), en: 'English', fr: 'Français' }}
            onChange={(v) => dispatch(setLanguage(v))}
          />
        </Row>
      </Card>
    </View>
  );
}
