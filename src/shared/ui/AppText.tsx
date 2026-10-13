import { useTheme } from '@/shared/theme/useTheme';
import { Text, type TextProps } from 'react-native';

type Variant = 'title' | 'body' | 'caption' | 'number';

export function AppText({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const t = useTheme();
  const v = {
    title: { fontSize: t.fontSize.xl, fontWeight: '700' as const, color: t.colors.text },
    body: { fontSize: t.fontSize.md, color: t.colors.text },
    caption: { fontSize: t.fontSize.sm, color: t.colors.textMuted },
    number: {
      fontSize: t.fontSize.xxl,
      fontWeight: '800' as const,
      color: t.colors.text,
      fontVariant: ['tabular-nums' as const],
    },
  }[variant];
  return <Text style={[v, style]} {...rest} />;
}
