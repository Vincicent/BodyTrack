import { useTheme } from '@/shared/theme/useTheme';
import { ScrollView, StyleSheet, type ViewProps } from 'react-native';

export function Screen({ children, style }: ViewProps) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: t.colors.background }}
      contentContainerStyle={[styles.content, { padding: t.spacing.lg, gap: t.spacing.lg }, style]}
      contentInsetAdjustmentBehavior="automatic"
      // With the keyboard open, a tap on a button (Save) must press it. The default ("never") only closes the keyboard,
      // so users had to tap twice. Found by the Maestro flow.
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ content: { flexGrow: 1 } });
