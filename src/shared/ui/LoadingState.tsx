import { useTheme } from '@/shared/theme/useTheme';
import { ActivityIndicator, View } from 'react-native';

export function LoadingState() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={t.colors.primary} accessibilityLabel="Loading" />
    </View>
  );
}
