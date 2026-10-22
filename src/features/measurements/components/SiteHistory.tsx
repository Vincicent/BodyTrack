import type { MeasurementSite } from '@/shared/lib/measurementSites';
import type { LengthUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, EmptyState, ErrorScreen, LoadingState, Screen, SwipeableRow } from '@/shared/ui';
import { TrendChart } from '@/shared/ui/charts/TrendChart';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { measurementRepository } from '../data/measurementRepository';
import { formatLength, formatLengthChange, siteChartPoints } from '../domain/siteSummary';
import { useMeasurements } from '../hooks/useMeasurements';

/**
 * A chart of one site, then every measurement, newest first, with the change from the previous one. Tap a measurement
 * for its details; swipe it (or long press) to edit or delete it.
 */
export function SiteHistory({ site, unit }: { site: MeasurementSite; unit: LengthUnit }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { entries, isLoading, error, refresh } = useMeasurements(site); // newest first
  if (error) return <ErrorScreen error={error} retry={refresh} />;
  if (isLoading) return <LoadingState />;
  if (entries.length === 0) {
    return (
      <EmptyState
        title={t('measurement.empty')}
        action={{ label: t('measurement.addTitle'), href: '/measurement/new' }}
      />
    );
  }
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const points = siteChartPoints(entries, unit);
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 });
  return (
    <Screen>
      {points ? (
        <TrendChart data={points} formatY={(v) => number.format(v)} />
      ) : (
        <AppText variant="caption">{t('chart.notEnough')}</AppText>
      )}
      {entries.map((entry, i) => {
        const previous = entries[i + 1]; // the list is newest first
        const change = formatLengthChange(
          previous ? entry.valueCm - previous.valueCm : null,
          unit,
          i18n.language,
        );
        const value = formatLength(entry.valueCm, unit, i18n.language);
        return (
          <SwipeableRow
            key={entry.id}
            accessibilityLabel={[date.format(entry.measuredAt), value, change, entry.note]
              .filter(Boolean)
              .join(', ')}
            onPress={() =>
              router.push({ pathname: '/measurement/entry/[id]', params: { id: String(entry.id) } })
            }
            actions={[
              {
                label: t('common.edit'),
                tone: 'primary',
                onPress: () =>
                  router.push({
                    pathname: '/measurement/edit/[id]',
                    params: { id: String(entry.id) },
                  }),
              },
              {
                label: t('common.delete'),
                tone: 'danger',
                onPress: () => measurementRepository.remove(entry.id),
              },
            ]}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.md,
              backgroundColor: theme.colors.background, // opaque: covers the actions until swiped
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View>
              <AppText>{date.format(entry.measuredAt)}</AppText>
              {entry.note ? <AppText variant="caption">{entry.note}</AppText> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText>{value}</AppText>
              {change ? <AppText variant="caption">{change}</AppText> : null}
            </View>
          </SwipeableRow>
        );
      })}
    </Screen>
  );
}
