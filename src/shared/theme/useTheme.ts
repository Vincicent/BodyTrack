import { useColorScheme } from 'react-native';
import { useThemePreference } from './ThemePreference';
import { fontSize, radius, spacing, themes, type ColorSchemeName, type Theme } from './tokens';

/** The resolved colour scheme: the user's choice, or the system's when set to "system". */
export function useColorSchemeName(): ColorSchemeName {
  const preference = useThemePreference();
  const system = useColorScheme(); // can be 'light' | 'dark' | 'unspecified' | null
  if (preference !== 'system') return preference;
  return system === 'dark' ? 'dark' : 'light';
}

export function useTheme(): Theme {
  return { colors: themes[useColorSchemeName()], spacing, radius, fontSize };
}
