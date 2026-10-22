import type { MeasurementSite } from '@/shared/lib/measurementSites';
import type { LengthUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import { Button } from '@/shared/ui';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  measurementEntryFormSchema,
  type MeasurementEntryFormInput,
  type MeasurementEntryFormOutput,
} from '../domain/measurementForm';

type Props = {
  site: MeasurementSite;
  unit: LengthUnit;
  defaultValues: MeasurementEntryFormInput;
  onSubmit: (values: MeasurementEntryFormOutput) => Promise<void>;
};

/** Edits ONE measurement: its value (in the user's unit) and date. The site itself doesn't change. */
export function MeasurementEntryForm({ site, unit, defaultValues, onSubmit }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementEntryFormInput, unknown, MeasurementEntryFormOutput>({
    resolver: zodResolver(measurementEntryFormSchema),
    defaultValues,
  });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Controller
        control={control}
        name="value"
        render={({ field }) => (
          <TextField
            label={t(`sites.${site}`)}
            testID="measurement-value" // E2E selector: the label and the input share the same name
            unit={unit}
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.value?.message ? t(errors.value.message) : undefined}
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
            maximumDate={new Date()} // the picker can't pick a future date: no error to show
          />
        )}
      />
      <Button
        title={t('form.saveChanges')}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
}
