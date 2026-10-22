import { useTheme } from '@/shared/theme/useTheme';
import { Pressable, Text } from 'react-native';

/**
 * A text-only button for the navigation header ("Cancel", "Edit"): no border or background, like the system ones
 * on iOS and Android. Buttons inside a screen keep using Button.
 */
export function HeaderButton({ title, onPress }: { title: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress()}
      hitSlop={12}
      style={({ pressed }) => ({ paddingHorizontal: theme.spacing.md, opacity: pressed ? 0.5 : 1 })}
    >
      <Text style={{ color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: '600' }}>
        {title}
      </Text>
    </Pressable>
  );
}
