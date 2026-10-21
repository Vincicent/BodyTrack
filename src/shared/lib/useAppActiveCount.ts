import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Increments each time the app comes back to the foreground.
 * Use it to recompute anything that depends on "now" (the app may stay in memory for days).
 */
export function useAppActiveCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', (next) => {
      if (previous !== 'active' && next === 'active') setCount((c) => c + 1);
      previous = next;
    });
    return () => subscription.remove();
  }, []);
  return count;
}
