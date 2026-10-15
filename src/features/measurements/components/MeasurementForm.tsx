import { MEASUREMENT_SITES } from '@/shared/lib/measurementSites';
import type { LengthUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button } from '@/shared/ui';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  emptyMeasurementValues,
  measurementFormSchema,
  type MeasurementFormInput,
  type MeasurementFormOutput,
} from '../domain/measurementForm';

type Props = { unit: LengthUnit; onSubmit: (values: MeasurementFormOutput) => Promise<void> };

export function MeasurementForm({ unit, onSubmit }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementFormInput, unknown, MeasurementFormOutput>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: { measuredAt: new Date(), values: emptyMeasurementValues() },
  });

  return (
    <View style={{ gap: theme.spacing.md }}>
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
      {MEASUREMENT_SITES.map((site) => (
        <Controller
          key={site}
          control={control}
          name={`values.${site}`}
          render={({ field }) => (
            <TextField
              label={t(`sites.${site}`)}
              unit={unit}
              keyboardType="decimal-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.values?.[site]?.message ? t(errors.values[site].message) : undefined}
            />
          )}
        />
      ))}
      {errors.values?.root?.message || errors.values?.message ? (
        <AppText style={{ color: theme.colors.danger }}>
          {t((errors.values.root?.message ?? errors.values.message) as string)}
        </AppText>
      ) : null}
      <Button title={t('common.save')} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </View>
  );
}
