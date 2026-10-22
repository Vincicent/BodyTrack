import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MeasurementEntryForm } from '@/features/measurements/components/MeasurementEntryForm';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { selectLengthUnit } from '@/features/settings';
import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { cmTo, round, toCm } from '@/shared/lib/units';
import { AppText, Button, Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';

/** Like "Edit weight": correct one measurement's value or date, or delete it. */
export default function EditMeasurementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const unit = useAppSelector(selectLengthUnit);
  const entry = measurementRepository.getById(Number(id));

  if (!entry) {
    return (
      <Screen>
        <AppText>{t('notFound.message')}</AppText>
      </Screen>
    );
  }

  const onDelete = async () => {
    const ok = await confirm({
      title: t('form.deleteConfirmTitle'),
      message: t('form.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    measurementRepository.remove(entry.id);
    goBackOrHome();
  };

  return (
    <Screen>
      <MeasurementEntryForm
        site={entry.site}
        unit={unit}
        defaultValues={{
          value: String(round(cmTo(unit, entry.valueCm), 1)),
          measuredAt: entry.measuredAt,
        }}
        onSubmit={async ({ value, measuredAt }) => {
          measurementRepository.update(entry.id, { valueCm: toCm(unit, value), measuredAt });
          goBackOrHome();
        }}
      />
      <Button title={t('form.deleteEntry')} variant="ghost" onPress={onDelete} />
    </Screen>
  );
}
