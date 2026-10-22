import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { View } from 'react-native';
import type { BodyFigureProps } from './BodyFigure.types';

export type { BodyFigureProps } from './BodyFigure.types';

// Web: Skia runs on CanvasKit (WebAssembly), which must load before any Skia component renders.
export function BodyFigure(props: BodyFigureProps) {
  return (
    <WithSkiaWeb
      getComponent={() => import('./BodyFigureImpl')}
      componentProps={props}
      opts={{ locateFile: (file) => `/${file}` }}
      fallback={<View style={{ height: props.layout.height }} />}
    />
  );
}
