import { useTheme } from '@/shared/theme/useTheme';
import { useRef, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
// Gesture Handler's Pressable, not React Native's: it is cancelled when the swipe takes over, so releasing after a
// drag (mouse on web, finger on a phone) is not a tap.
import { Pressable } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText } from './AppText';

export type RowAction = { label: string; onPress: () => void; tone: 'primary' | 'danger' };

type Props = {
  /** Tap: open the item (its details). */
  onPress: () => void;
  /**
   * Revealed by swiping left, or by a long press (easier with a mouse, and for switch or screen reader users).
   * In display order, left to right (the last one sits against the screen edge).
   */
  actions: RowAction[];
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** A list row: tap to open, swipe left (or long press) for its actions, like Mail or Reminders. */
export function SwipeableRow({ onPress, actions, accessibilityLabel, style, children }: Props) {
  const theme = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);
  // True when the current press turned into a swipe: on web, a fast mouse drag still ends with a click, ignore it.
  const swiped = useRef(false);
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      onSwipeableOpenStartDrag={() => {
        swiped.current = true;
      }}
      onSwipeableCloseStartDrag={() => {
        swiped.current = true;
      }}
      renderRightActions={() =>
        // the library lays out right actions from the edge inwards (row-reverse): reverse to keep our order
        [...actions].reverse().map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => {
              swipeable.current?.close();
              action.onPress();
            }}
            style={{
              backgroundColor:
                action.tone === 'danger' ? theme.colors.danger : theme.colors.primary,
              justifyContent: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            <AppText style={{ color: theme.colors.onPrimary, fontWeight: '600' }}>
              {action.label}
            </AppText>
          </Pressable>
        ))
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => {
          swiped.current = false; // a new press starts
        }}
        onPress={() => {
          if (swiped.current) return;
          onPress();
        }}
        onLongPress={() => swipeable.current?.openRight()}
        style={style}
      >
        {children}
      </Pressable>
    </ReanimatedSwipeable>
  );
}
