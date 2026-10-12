import { useTheme } from '@/shared/theme/useTheme';
import { View, ViewProps } from "react-native";
import { AppText } from './AppText';

type CardProps = ViewProps & {title?: string};

export function Card({ title, children, style, ...rest}: CardProps) {
    const t = useTheme();
    return (
        <View
            style={[
                {
                    backgroundColor: t.colors.surface, borderRadius: t.radius.md, padding: t.spacing.lg,
                    borderWidth: 1, borderColor: t.colors.border, gap: t.spacing.sm,
                },
                style
            ]}
            {...rest}
            >
                {title ? <AppText variant="caption">{title}</AppText> : null}

            </View>
        );
}