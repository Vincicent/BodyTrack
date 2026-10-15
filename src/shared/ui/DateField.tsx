import { useTheme } from '@/shared/theme/useTheme';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import type { DateFieldProps } from './DateField.types';

export function DateField({ label, value, onChange, maximumDate }: DateFieldProps) {
  const t = useTheme();

  if (Platform.OS === 'ios') {
    // iOS: a compact native picker that opens a calendar popover on tap
    return (
      <View style={{ gap: t.spacing.xs, alignItems: 'flex-start' }}>
        <AppText variant="caption">{label}</AppText>
        <DateTimePicker
          value={value}
          mode="datetime"
          display="compact"
          maximumDate={maximumDate}
          onValueChange={(_, date) => onChange(date)}
          accessibilityLabel={label}
        />
      </View>
    );
  }

  // Android: a row that opens the system dialog imperatively (no hidden picker state to manage)
  const open = () =>
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      maximumDate,
      onValueChange: (_, date) => onChange(date),
    });
  return (
    <View style={{ gap: t.spacing.xs }}>
      <AppText variant="caption">{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={open}
        style={{
          borderWidth: 1.5,
          borderColor: t.colors.border,
          borderRadius: t.radius.md,
          padding: t.spacing.md,
        }}
      >
        <AppText>{value.toLocaleDateString()}</AppText>
      </Pressable>
    </View>
  );
}
