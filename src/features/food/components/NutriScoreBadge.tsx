import { useLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
import { usesNutriScore } from '../domain/nutrition';
import type { NutriScore } from '../domain/product';

const GRADES: readonly NutriScore[] = ['a', 'b', 'c', 'd', 'e'];

// The scale's official colours (dark green → red), as on packs. Not the logo itself: it's a trademark of Santé publique
// France, reserved to food companies that register.
const COLORS: Record<NutriScore, { background: string; text: string }> = {
  a: { background: '#038141', text: '#FFFFFF' },
  b: { background: '#85BB2F', text: '#FFFFFF' },
  c: { background: '#FECB02', text: '#3B2F00' },
  d: { background: '#EE8100', text: '#FFFFFF' },
  e: { background: '#E63E11', text: '#FFFFFF' },
};

/**
 * The A–E scale with the product's grade enlarged. Screen readers hear one sentence: "Nutri-Score E". Nothing when the
 * grade is unknown, or where shoppers don't know Nutri-Score.
 */
export function NutriScoreBadge({ grade }: { grade: NutriScore | null }) {
  const theme = useTheme();
  const { t } = useTranslation();
  // The phone's country, not its language: Nutri-Score is used in Germany or Belgium, and unknown in Quebec
  const region = useLocales()[0]?.regionCode;
  if (!grade || !usesNutriScore(region)) return null;
  return (
    <View
      accessible
      accessibilityLabel={t('food.nutriScore', { grade: grade.toUpperCase() })}
      style={{ alignSelf: 'flex-start', gap: theme.spacing.xs }}
    >
      <AppText variant="caption" style={{ fontWeight: '700', letterSpacing: 1 }}>
        NUTRI-SCORE
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {GRADES.map((g, i) => {
          const selected = g === grade;
          return (
            <View
              key={g}
              style={{
                width: selected ? 44 : 32,
                height: selected ? 52 : 38,
                marginHorizontal: selected ? -4 : 0, // the chosen letter overlaps its neighbours
                zIndex: selected ? 1 : 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS[g].background,
                opacity: selected ? 1 : 0.55,
                borderTopLeftRadius: selected || i === 0 ? theme.radius.md : 0,
                borderBottomLeftRadius: selected || i === 0 ? theme.radius.md : 0,
                borderTopRightRadius: selected || i === GRADES.length - 1 ? theme.radius.md : 0,
                borderBottomRightRadius: selected || i === GRADES.length - 1 ? theme.radius.md : 0,
                borderWidth: selected ? 3 : 0,
                borderColor: theme.colors.surface,
              }}
            >
              <AppText
                style={{
                  color: COLORS[g].text,
                  fontWeight: '800',
                  fontSize: selected ? theme.fontSize.xl : theme.fontSize.md,
                }}
              >
                {g.toUpperCase()}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
