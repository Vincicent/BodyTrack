import { useTheme } from '@/shared/theme/useTheme';
import { Pressable, Text } from 'react-native';

type ButtonProps = {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
    disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled = false} : ButtonProps) {
    const t = useTheme();
    const primary = variant === 'primary';
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{disabled}}
            disabled={disabled}
            onPress={() => onPress()}
            hitSlop={8}
            style={({ pressed }) => ({
                backgroundColor: primary ? t.colors.primary : 'transparent',
                borderWidth: primary ? 0 : 1,
                borderColor: t.colors.border,
                paddingVertical: t.spacing.md,
                paddingHorizontal: t.spacing.lg,
                borderRadius: t.radius.md,
                alignItems: 'center',
                opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
            })}
            >
                <Text style={{ color: primary ? t.colors.onPrimary : t.colors.primary, fontSize: t.fontSize.md, fontWeight: '600' }}>
                    {title}
                </Text>
            </Pressable>
    );
}