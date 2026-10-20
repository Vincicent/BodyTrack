import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Card, SegmentedControl } from '@/shared/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { chartSeries, trendSummary, type Period } from '../domain/chartSeries';
import type { WeightEntry } from '../domain/weight';
import { useFormatWeight } from '../hooks/useFormatWeight';
import { WeightChart } from './WeightChart';

export function TrendCard({ entries }: { entries: WeightEntry[] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatWeight = useFormatWeight();
  const [period, setPeriod] = useState<Period>('1M');
  const data = chartSeries(entries, period);
  const summary = trendSummary(data);
  const sentence =
    summary.kind === 'notEnough'
      ? t('chart.notEnough')
      : summary.kind === 'stable'
        ? t('chart.stable', { days: summary.days })
        : t(`chart.${summary.kind}`, { value: formatWeight(summary.kg), days: summary.days });

  return (
    <Card title={t('chart.trend')}>
      <SegmentedControl
        value={period}
        options={['1M', '3M', '1Y', 'ALL'] as const}
        onChange={setPeriod}
      />
      {summary.kind === 'notEnough' ? (
        <AppText variant="caption">{sentence}</AppText>
      ) : (
        // The chart is a picture: give screen readers the same information in words.
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={sentence}
          style={{ marginTop: theme.spacing.sm }}
        >
          <WeightChart data={data} formatY={(kg) => formatWeight(kg).split(' ')[0]!} />
        </View>
      )}
    </Card>
  );
}
