import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import type { LengthUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, EmptyState, LoadingState, Screen } from '@/shared/ui';
import { formatLength, formatLengthChange, summarizeSites } from '../domain/siteSummary';
import { useMeasurements } from '../hooks/useMeasurements';

/** The Measurements tab: one row per measured site, with its latest value and the change since the start. */
export function SiteSummaryList({ unit }: { unit: LengthUnit }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { entries, isLoading } = useMeasurements();
  if (isLoading) return <LoadingState />;
  const sites = summarizeSites(entries);
  if (sites.length === 0) {
    return (
      <EmptyState
        title={t('measurement.empty')}
        action={{ label: t('measurement.addTitle'), href: '/measurement/new' }}
      />
    );
  }
  const day = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' });
  return (
    <Screen>
      {sites.map(({ site, latest, changeCm }) => {
        const name = t(`sites.${site}`);
        const value = formatLength(latest.valueCm, unit, i18n.language);
        const change = formatLengthChange(changeCm, unit, i18n.language);
        const arrow =
          changeCm === null || change?.startsWith('±') ? '' : changeCm > 0 ? '▲ ' : '▼ ';
        const sinceStart = change ? t('measurement.sinceStart', { value: change }) : '';
        return (
          <Pressable
            key={site}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${value}. ${sinceStart}`}
            onPress={() => router.push({ pathname: '/measurement/[site]', params: { site } })}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View>
              <AppText>{name}</AppText>
              <AppText variant="caption">{day.format(latest.measuredAt)}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText>{value}</AppText>
              {change ? (
                <AppText variant="caption">
                  {arrow}
                  {sinceStart}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}
