import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
// Gesture Handler's Pressable, not React Native's: it is cancelled when the swipe takes over, so releasing after a
// drag (mouse on web, finger on a phone) is not a tap.
import { Pressable } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { WeightUnit } from '@/shared/lib/units';
import { kgTo } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
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
  const swipeable = useRef<SwipeableMethods>(null);
  // True when the current press turned into a swipe: on web, a fast mouse drag still ends with a click, ignore it.
  const swiped = useRef(false);
  const weight = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(kgTo(unit, entry.weightKg));
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

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      onSwipeableOpenStartDrag={() => {
        swiped.current = true;
      }}
      onSwipeableCloseStartDrag={() => {
        swiped.current = true;
      }}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
          onPress={() => onDelete(entry.id)}
          style={{
            backgroundColor: theme.colors.danger,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.xl,
          }}
        >
          <AppText style={{ color: theme.colors.onPrimary, fontWeight: '600' }}>
            {t('common.delete')}
          </AppText>
        </Pressable>
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${date}, ${weight} ${unit}. ${spokenDelta}`}
        onPressIn={() => {
          swiped.current = false; // a new press starts
        }}
        onPress={() => {
          if (swiped.current) return;
          router.push({ pathname: '/entry/[id]', params: { id: String(entry.id) } });
        }}
        // Long press = show the row's actions (the same as swiping): easier with a mouse, and never opens the edit screen
        onLongPress={() => swipeable.current?.openRight()}
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
          <AppText>{date}</AppText>
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
      </Pressable>
    </ReanimatedSwipeable>
  );
}
