import { selectBmi, selectGoalKg, selectWeightUnit } from '@/features/settings';
import { useAppActiveCount } from '@/shared/lib/useAppActiveCount';
import { useIsWide } from '@/shared/lib/useIsWide';
import { useTheme } from '@/shared/theme/useTheme';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorScreen,
  FadeInView,
  LoadingState,
  Screen,
} from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { formatDelta } from '../domain/history';
import { changeOver, goalProgress, movingAverage, sortByDate } from '../domain/stats';
import { useFormatWeight } from '../hooks/useFormatWeight';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { TrendCard } from './TrendCard';

export function DashboardView() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { entries, isLoading, error, refresh } = useWeightEntries();
  const formatWeight = useFormatWeight();
  const unit = useAppSelector(selectWeightUnit);
  const goalKg = useAppSelector(selectGoalKg);
  const latest = entries[0];
  const bmiValue = useAppSelector((s) => selectBmi(s, latest?.weightKg ?? null));
  const wide = useIsWide();
  useAppActiveCount(); // re-render when the app returns to the foreground, so "7 days" is relative to the real today

  if (error) return <ErrorScreen error={error} retry={refresh} />;
  if (isLoading) return <LoadingState />;
  if (!latest) {
    return (
      <EmptyState
        title={t('history.empty')}
        action={{ label: t('history.emptyAction'), href: '/entry/new' }}
      />
    );
  }

  const weekChange = formatDelta(changeOver(entries, 7), unit, i18n.language);
  const average = movingAverage(entries).at(-1)?.value;
  const start = sortByDate(entries)[0]!;
  const progress = goalKg === null ? null : goalProgress(start.weightKg, latest.weightKg, goalKg);

  return (
    <Screen>
      <AppText variant="title">{t('dashboard.title')}</AppText>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: theme.spacing.lg }}>
        <View style={{ flex: wide ? 1 : undefined, gap: theme.spacing.lg }}>
          <FadeInView index={0}>
            <Card title={t('dashboard.currentWeight')}>
              <AppText variant="number">{formatWeight(latest.weightKg)}</AppText>
              {weekChange ? <AppText variant="caption">{weekChange} · 7 d</AppText> : null}
            </Card>
          </FadeInView>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Card title={t('dashboard.sevenDayAvg')} style={{ flex: 1 }}>
              <AppText variant="title">
                {average === undefined ? '—' : formatWeight(average)}
              </AppText>
            </Card>
            {bmiValue !== null ? (
              <Card title={t('dashboard.bmi')} style={{ flex: 1 }}>
                <AppText variant="title">{bmiValue.toFixed(1)}</AppText>
              </Card>
            ) : null}
          </View>
          {goalKg !== null && progress !== null ? (
            <Card title={`${t('dashboard.goal')} · ${formatWeight(goalKg)}`}>
              <AppText>
                {progress >= 1
                  ? t('dashboard.goalReached')
                  : t('dashboard.toGo', {
                      value: formatWeight(Math.abs(latest.weightKg - goalKg)),
                    })}
              </AppText>
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.border,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    backgroundColor: theme.colors.primary,
                  }}
                />
              </View>
            </Card>
          ) : null}
        </View>
        <View style={{ flex: wide ? 1 : undefined }}>
          <TrendCard entries={entries} />
        </View>
      </View>
      <Button title={t('dashboard.addWeight')} onPress={() => router.push('/entry/new')} />
    </Screen>
  );
}
