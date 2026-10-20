/** One point: when (ms), the measured value (a dot) and the trend at that time (the line). */
export type TrendPoint = { t: number; value: number; trend: number };

export type TrendChartProps = { data: TrendPoint[]; formatY: (value: number) => string };
