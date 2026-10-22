import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { WeightUnit } from '@/shared/lib/units';
import { formatWeightNumber } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, SwipeableRow } from '@/shared/ui';
import { formatDelta, type HistoryRow } from '../domain/history';

type Props = {
  row: Extract<HistoryRow, { type: 'entry' }>;
  unit: WeightUnit;
  onDelete: (id: number) => void;
};

export function WeightRow({ row, unit, onDelete }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { entry, deltaKg } = row;
  const weight = formatWeightNumber(entry.weightKg, unit, locale);
  const delta = formatDelta(deltaKg, unit, locale);
  const direction =
    deltaKg === null
      ? null
      : delta?.startsWith('+')
        ? 'up'
        : delta?.startsWith('±')
          ? 'stable'
          : 'down';
  // Never colour alone: the arrow and the sign carry the meaning, colour is a bonus.
  const arrow = direction === 'up' ? '▲ ' : direction === 'down' ? '▼ ' : '';
  const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(
    entry.measuredAt,
  );
  const spokenDelta =
    direction && direction !== 'stable'
      ? t(`history.${direction}`, { value: `${delta?.slice(1)} ${unit}` })
      : '';

  const params = { id: String(entry.id) };
  return (
    <SwipeableRow
      accessibilityLabel={`${date}, ${weight} ${unit}${entry.photoUri ? `, ${t('photo.withPhoto')}` : ''}. ${spokenDelta}`}
      onPress={() => router.push({ pathname: '/entry/[id]', params })}
      actions={[
        {
          label: t('common.edit'),
          tone: 'primary',
          onPress: () => router.push({ pathname: '/entry/edit/[id]', params }),
        },
        { label: t('common.delete'), tone: 'danger', onPress: () => onDelete(entry.id) },
      ]}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <AppText>{date}</AppText>
          {entry.photoUri ? (
            <Ionicons name="image-outline" size={14} color={theme.colors.textMuted} />
          ) : null}
        </View>
        {entry.note ? <AppText variant="caption">{entry.note}</AppText> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <AppText>
          {weight} {unit}
        </AppText>
        {delta ? (
          <AppText
            variant="caption"
            style={{
              color:
                direction === 'down'
                  ? theme.colors.success
                  : direction === 'up'
                    ? theme.colors.danger
                    : theme.colors.textMuted,
            }}
          >
            {arrow}
            {delta}
          </AppText>
        ) : null}
      </View>
    </SwipeableRow>
  );
}
