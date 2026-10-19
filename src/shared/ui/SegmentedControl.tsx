import { useTheme } from '@/shared/theme/useTheme';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

type Props<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
};

export function SegmentedControl<T extends string>({ value, options, onChange, labels }: Props<T>) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.border,
        borderRadius: t.radius.md,
        padding: 2,
      }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: t.spacing.sm,
              borderRadius: t.radius.md - 2,
              backgroundColor: selected ? t.colors.surface : 'transparent',
            }}
          >
            <AppText style={{ fontWeight: selected ? '600' : '400' }}>
              {labels?.[option] ?? option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
