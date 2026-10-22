import { Canvas, Circle, Group, Line, Path, vec } from '@shopify/react-native-skia';
import { useTheme } from '@/shared/theme/useTheme';
import { BODY } from '../../domain/bodyMap';
import type { BodyFigureProps } from './BodyFigure.types';

/**
 * The drawing only: silhouette, a dot per site, a line from each dot to its label. Decorative for screen readers
 * (the labels are the buttons), so it carries no text.
 */
export default function BodyFigureImpl({ layout, measured }: BodyFigureProps) {
  const theme = useTheme();
  const { x, y, scale } = layout.figure;
  return (
    <Canvas
      style={{ position: 'absolute', width: layout.width, height: layout.height }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Group transform={[{ translateX: x }, { translateY: y }, { scale }]}>
        <Path path={BODY.outline} color={theme.colors.surface} />
        <Path
          path={BODY.outline}
          style="stroke"
          strokeWidth={1.2 / scale}
          color={theme.colors.textMuted}
        />
      </Group>
      {layout.sites.map(({ site, dot, lineEnd }) => (
        <Line
          key={`line-${site}`}
          p1={vec(dot.x, dot.y)}
          p2={vec(lineEnd.x, lineEnd.y)}
          color={theme.colors.border}
          strokeWidth={1}
        />
      ))}
      {layout.sites.map(({ site, dot }) =>
        measured.has(site) ? (
          <Circle key={site} cx={dot.x} cy={dot.y} r={5} color={theme.colors.primary} />
        ) : (
          // Never measured: an empty dot, not a made-up value
          <Circle
            key={site}
            cx={dot.x}
            cy={dot.y}
            r={4.5}
            style="stroke"
            strokeWidth={1.5}
            color={theme.colors.textMuted}
          />
        ),
      )}
    </Canvas>
  );
}
