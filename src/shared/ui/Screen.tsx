import { useTheme } from '@/shared/theme/useTheme';
import { ScrollView, StyleSheet, type ViewProps } from 'react-native';

export function Screen({ children, style }: ViewProps) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: t.colors.background }}
      contentContainerStyle={[styles.content, { padding: t.spacing.lg, gap: t.spacing.lg }, style]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ content: { flexGrow: 1 } });