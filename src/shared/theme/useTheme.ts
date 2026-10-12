import { useColorScheme } from 'react-native';
import { fontSize, radius, spacing, themes, type Theme } from './tokens';

export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: themes[scheme], spacing, radius, fontSize };
}