import { useTheme } from '@/shared/theme/useTheme';
import { TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './AppText';

type TextFieldProps = TextInputProps & { label: string; error?: string; unit?: string };

export function TextField({ label, error, unit, style, ...rest }: TextFieldProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.xs }}>
      <AppText variant="caption">{label}</AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderRadius: t.radius.md,
          borderColor: error ? t.colors.danger : t.colors.border,
          backgroundColor: t.colors.surface,
          paddingHorizontal: t.spacing.md,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={t.colors.textMuted}
          style={[
            {
              flex: 1,
              paddingVertical: t.spacing.md,
              fontSize: t.fontSize.lg,
              color: t.colors.text,
            },
            style,
          ]}
          {...rest}
        />
        {unit ? <AppText variant="caption">{unit}</AppText> : null}
      </View>
      {error ? (
        <AppText style={{ color: t.colors.danger, fontSize: t.fontSize.sm }}>{error}</AppText>
      ) : null}
    </View>
  );
}
