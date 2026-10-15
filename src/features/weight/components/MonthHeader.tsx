import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
import { View } from 'react-native';

export function MonthHeader({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.colors.background,
        paddingHorizontal: t.spacing.lg,
        paddingTop: t.spacing.lg,
        paddingBottom: t.spacing.xs,
      }}
    >
      <AppText
        variant="caption"
        accessibilityRole="header"
        style={{ fontWeight: '700', textTransform: 'uppercase' }}
      >
        {label}
      </AppText>
    </View>
  );
}
