import { TrendChart } from '@/shared/ui/charts/TrendChart';
import type { ChartPoint } from '../domain/chartSeries';

export type WeightChartProps = { data: ChartPoint[]; formatY: (kg: number) => string };

/** Raw weights as dots, the 7-day average as the line: a thin wrapper around the shared TrendChart. */
export function WeightChart({ data, formatY }: WeightChartProps) {
  return (
    <TrendChart
      data={data.map((p) => ({ t: p.t, value: p.weight, trend: p.avg }))}
      formatY={formatY}
    />
  );
}
