import { DAY_MS, movingAverage, sortByDate } from './stats';
import type { WeightEntry } from './weight';

export type Period = '1M' | '3M' | '1Y' | 'ALL';
export type ChartPoint = { t: number; weight: number; avg: number };

const PERIOD_DAYS: Record<Exclude<Period, 'ALL'>, number> = { '1M': 30, '3M': 90, '1Y': 365 };

/** Points for the chart, ascending. The average is computed on ALL data first, then filtered by period. */
export function chartSeries(
  entries: WeightEntry[],
  period: Period,
  now = new Date(),
): ChartPoint[] {
  const sorted = sortByDate(entries);
  const averages = movingAverage(sorted); // same order as `sorted`
  const from = period === 'ALL' ? -Infinity : now.getTime() - PERIOD_DAYS[period] * DAY_MS;
  return sorted
    .map((e, i) => ({ t: e.measuredAt.getTime(), weight: e.weightKg, avg: averages[i]!.value }))
    .filter((p) => p.t >= from);
}

export type TrendSummary =
  | { kind: 'notEnough' }
  | { kind: 'stable'; days: number }
  | { kind: 'down' | 'up'; days: number; kg: number };

/** What the trend line says, as data (the UI turns it into a translated sentence for screen readers). */
export function trendSummary(series: ChartPoint[]): TrendSummary {
  if (series.length < 2) return { kind: 'notEnough' };
  const first = series[0]!;
  const last = series.at(-1)!;
  const days = Math.round((last.t - first.t) / DAY_MS);
  const diff = last.avg - first.avg;
  if (Math.abs(diff) < 0.05) return { kind: 'stable', days };
  return { kind: diff < 0 ? 'down' : 'up', days, kg: Math.abs(diff) };
}
