import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
import { nutritionTable, type Level, type NutritionRow } from '../domain/nutrition';
import type { FoodProduct } from '../domain/product';

/**
 * The nutrition table in the EU order (energy, fat and its "of which" rows, carbohydrate, sugars, fibre, protein, salt),
 * with the share of the daily reference intake. Fat, saturates, sugars and salt get their level; the other rows an EU
 * claim when one applies ("High protein"). Levels and claims are always written in words: colour is only a bonus.
 */
export function NutritionPanel({ product }: { product: FoodProduct }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const grams = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 });
  const whole = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 });
  const levelColor: Record<Level, string> = {
    low: theme.colors.success,
    medium: theme.colors.warning,
    high: theme.colors.danger,
  };

  const amountOf = ({ row, per100, kj }: NutritionRow) => {
    if (per100 === null) return '—';
    if (row === 'energy') {
      // kJ first, as the EU nutrition declaration requires (Regulation (EU) No 1169/2011, Annex XV)
      const kcal = t('food.kcal', { value: whole.format(per100) });
      return kj == null ? kcal : t('food.energy', { kj: whole.format(kj), kcal });
    }
    return t('food.grams', { value: grams.format(per100) });
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      {nutritionTable(product).map((r) => {
        const name = t(`food.nutrients.${r.row}`);
        const amount = amountOf(r);
        const isRated =
          r.row === 'fat' || r.row === 'saturatedFat' || r.row === 'sugars' || r.row === 'salt';
        // Rated rows always say their level ("Unknown" when the amount is missing, never "Low"); others their claim, if any
        const verdict = r.level
          ? t(`food.levels.${r.level}`)
          : isRated
            ? t('food.levels.unknown')
            : r.claim
              ? t(`food.claims.${r.claim}`)
              : '';
        const verdictColor = r.level
          ? levelColor[r.level]
          : r.claim
            ? theme.colors.success
            : theme.colors.textMuted;
        const share =
          r.percentOfReference === null
            ? ''
            : t(r.row === 'fibre' ? 'food.ofFibreIntake' : 'food.ofReference', {
                value: r.percentOfReference,
              });
        return (
          <View
            key={r.row}
            accessible
            accessibilityLabel={[name, amount, verdict, share].filter(Boolean).join(', ')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: theme.spacing.sm,
              paddingLeft: r.partOfAbove ? theme.spacing.lg : 0, // "of which" rows sit under their total
            }}
          >
            <View style={{ flexShrink: 1 }}>
              <AppText style={r.partOfAbove ? undefined : { fontWeight: '600' }}>{name}</AppText>
              {share ? <AppText variant="caption">{share}</AppText> : null}
            </View>
            <View style={{ alignItems: 'flex-end', flexShrink: 0, maxWidth: '50%' }}>
              <AppText>{amount}</AppText>
              {verdict ? (
                <AppText
                  variant="caption"
                  style={{ fontWeight: '700', color: verdictColor, textAlign: 'right' }}
                >
                  {verdict}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}

      <AppText variant="caption">{t('food.whoAdvice')}</AppText>
      <AppText variant="caption">{t('food.disclaimer')}</AppText>
    </View>
  );
}
