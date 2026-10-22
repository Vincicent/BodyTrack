import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import type { LengthUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
import { bodyMapLayout, LABEL } from '../../domain/bodyMap';
import { formatLength, formatLengthChange, type SiteSummary } from '../../domain/siteSummary';
import { BodyFigure } from './BodyFigure';

/**
 * A front-view body with every measurement site: its latest value and the change since the start. Each label is a
 * button (the drawing itself is decorative): it opens the site's history, or the form when it was never measured.
 */
export function BodyMap({ summaries, unit }: { summaries: SiteSummary[]; unit: LengthUnit }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [width, setWidth] = useState(0);
  const bySite = new Map(summaries.map((s) => [s.site, s]));
  const layout = width > 0 ? bodyMapLayout(width) : null;

  return (
    <View
      testID="body-map"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: layout?.height ?? 0, minHeight: 200 }}
    >
      {layout ? (
        <>
          <BodyFigure layout={layout} measured={new Set(bySite.keys())} />
          {layout.sites.map(({ site, side, labelY }) => {
            const summary = bySite.get(site);
            const name = t(`sites.${site}`);
            const value = summary ? formatLength(summary.latest.valueCm, unit, i18n.language) : '—';
            const change = summary
              ? formatLengthChange(summary.changeCm, unit, i18n.language)
              : null;
            const sinceStart = change ? t('measurement.sinceStart', { value: change }) : '';
            return (
              <Pressable
                key={site}
                accessibilityRole="button"
                accessibilityLabel={
                  summary
                    ? [`${name}, ${value}`, sinceStart].filter(Boolean).join('. ')
                    : `${name}, ${t('measurement.notMeasured')}`
                }
                onPress={() =>
                  summary
                    ? router.push({ pathname: '/measurement/[site]', params: { site } })
                    : router.push('/measurement/new')
                }
                hitSlop={4}
                style={{
                  position: 'absolute',
                  top: labelY - LABEL.height / 2,
                  [side]: 0,
                  width: LABEL.width,
                  height: LABEL.height,
                  justifyContent: 'center',
                  alignItems: side === 'left' ? 'flex-end' : 'flex-start',
                  paddingHorizontal: theme.spacing.xs,
                }}
              >
                <AppText variant="caption" numberOfLines={1}>
                  {name}
                </AppText>
                <AppText
                  numberOfLines={1}
                  style={{ fontSize: theme.fontSize.sm, fontWeight: summary ? '600' : '400' }}
                >
                  {value}
                  {change && !change.startsWith('±') ? (
                    <AppText variant="caption"> {(summary?.changeCm ?? 0) > 0 ? '▲' : '▼'}</AppText>
                  ) : null}
                </AppText>
              </Pressable>
            );
          })}
        </>
      ) : null}
    </View>
  );
}
