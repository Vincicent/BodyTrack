import type { ReactNode } from 'react';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

/** Subtle entrance animation, skipped when the user asked the OS to reduce motion. */
export function FadeInView({ children, index = 0 }: { children: ReactNode; index?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(index * 60).duration(250)}>
      {children}
    </Animated.View>
  );
}
