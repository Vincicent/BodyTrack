import { selectWeightUnit } from '@/features/settings';
import { WeightForm } from '@/features/weight/components/WeightForm';
import { weightRepository } from '@/features/weight/data/weightRepository';
import { useSaveWeight } from '@/features/weight/hooks/useSaveWeight';
import { goBackOrHome } from '@/shared/lib/navigation';
import { kgTo, round } from '@/shared/lib/units';
import { AppText, Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Edit a weight entry (opened from its details or a swipe in the list). Deleting is on the details screen. */
export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const unit = useAppSelector(selectWeightUnit);
  const save = useSaveWeight(unit);
  const entry = weightRepository.getById(Number(id));

  if (!entry) {
    return (
      <Screen>
        <AppText>{t('notFound.message')}</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <WeightForm
        unit={unit}
        submitLabel={t('form.saveChanges')}
        defaultValues={{
          // the exact value (up to 2 decimals), never rounded to 1: saving a note must not turn 3.25 kg into 3.3
          weight: String(round(kgTo(unit, entry.weightKg), 2)),
          measuredAt: entry.measuredAt,
          note: entry.note ?? '',
          photo: entry.photoUri ? { stored: entry.photoUri } : null,
        }}
        onSubmit={async (values) => {
          await save(values, entry);
          goBackOrHome();
        }}
      />
    </Screen>
  );
}
