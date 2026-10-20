import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { ActivityIndicator } from 'react-native';
import type { TrendChartProps } from './TrendChart.types';

export type { TrendChartProps, TrendPoint } from './TrendChart.types';

// Web: Skia runs on CanvasKit (WebAssembly), which must load before any Skia component renders.
export function TrendChart(props: TrendChartProps) {
  return (
    <WithSkiaWeb
      getComponent={() => import('./TrendChartImpl')}
      componentProps={props}
      opts={{ locateFile: (file) => `/${file}` }}
      fallback={<ActivityIndicator />}
    />
  );
}
