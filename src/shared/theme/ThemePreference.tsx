import { createContext, useContext, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const ThemePreferenceContext = createContext<ThemePreference>('system');

/**
 * `shared/` must never import the store or a feature. So the app layer reads the user's preference from Redux
 * and passes it down here; useTheme() only knows about this context.
 */
export function ThemePreferenceProvider({
  value,
  children,
}: {
  value: ThemePreference;
  children: ReactNode;
}) {
  return <ThemePreferenceContext value={value}>{children}</ThemePreferenceContext>;
}

export const useThemePreference = () => useContext(ThemePreferenceContext);
