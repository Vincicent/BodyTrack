import { useWindowDimensions } from 'react-native';

/** True on tablets / large windows: switch to a two-column layout. Re-renders on rotation and window resize. */
export function useIsWide(breakpoint = 768): boolean {
  return useWindowDimensions().width >= breakpoint;
}
