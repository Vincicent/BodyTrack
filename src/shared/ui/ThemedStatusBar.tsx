import { useColorSchemeName } from '@/shared/theme/useTheme';
import { StatusBar } from 'expo-status-bar';

/**
 * Status bar icons that contrast with the app's header: dark on the light theme, light on the dark one.
 * Without it Android keeps its default light icons, invisible on our white headers (iOS adapts on its own).
 * Follows the app's theme setting, not only the system's.
 */
export function ThemedStatusBar() {
  return <StatusBar style={useColorSchemeName() === 'dark' ? 'light' : 'dark'} />;
}
