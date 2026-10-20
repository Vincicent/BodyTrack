import { useFont } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { useTheme } from '@/shared/theme/useTheme';
import type { TrendChartProps } from './TrendChart.types';

// Values as dots, the trend as a smooth line. Used by the weight chart and the measurement charts.
export default function TrendChartImpl({ data, formatY }: TrendChartProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const font = useFont(require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'), 11);
  const dayMonth = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' });
  return (
    <View style={{ height: 220 }}>
      <CartesianChart
        data={data}
        xKey="t"
        yKeys={['value', 'trend']}
        domainPadding={{ top: 20, bottom: 20, left: 10, right: 10 }}
        xAxis={{
          font,
          labelColor: theme.colors.textMuted,
          lineColor: theme.colors.border,
          tickCount: 4,
          formatXLabel: (ms) => dayMonth.format(ms),
        }}
        yAxis={[
          {
            font,
            labelColor: theme.colors.textMuted,
            lineColor: theme.colors.border,
            tickCount: 4,
            formatYLabel: formatY,
          },
        ]}
      >
        {({ points }) => (
          <>
            <Scatter points={points.value} radius={3} color={theme.colors.textMuted} />
            <Line
              points={points.trend}
              color={theme.colors.primary}
              strokeWidth={3}
              // monotoneX: smooth, but never goes back in time or overshoots (natural loops with close dates)
              curveType="monotoneX"
              animate={{ type: 'timing', duration: 300 }}
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}
