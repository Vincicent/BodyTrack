import type { WeightUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { Button } from '@/shared/ui';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  weightFormSchema,
  type WeightFormInput,
  type WeightFormOutput,
} from '../domain/weightForm';

type Props = {
  unit: WeightUnit;
  defaultValues?: Partial<WeightFormInput>;
  submitLabel?: string;
  onSubmit: (values: WeightFormOutput) => Promise<void>;
};

export function WeightForm({ unit, defaultValues, submitLabel, onSubmit }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeightFormInput, unknown, WeightFormOutput>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: { weight: '', measuredAt: new Date(), note: '', ...defaultValues },
  });
  const tr = (key?: string) => (key ? t(key) : undefined);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Controller
        control={control}
        name="weight"
        render={({ field }) => (
          <TextField
            label={t('form.weight')}
            // E2E selector: on iOS, tapping the label "Weight" doesn't focus the input
            testID="weight-input"
            unit={unit}
            keyboardType="decimal-pad"
            autoFocus
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={tr(errors.weight?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="measuredAt"
        render={({ field }) => (
          <DateField
            label={t('form.date')}
            value={field.value}
            onChange={field.onChange}
            maximumDate={new Date()}
          />
        )}
      />
      <Controller
        control={control}
        name="note"
        render={({ field }) => (
          <TextField
            label={t('form.note')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={tr(errors.note?.message)}
          />
        )}
      />
      <Button
        title={submitLabel ?? t('common.save')}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
}
