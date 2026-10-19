import { selectWeightUnit } from '@/features/settings';
import { WeightForm } from '@/features/weight/components/WeightForm';
import { weightRepository } from '@/features/weight/data/weightRepository';
import { useSaveWeight } from '@/features/weight/hooks/useSaveWeight';
import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { kgTo, round } from '@/shared/lib/units';
import { AppText, Button, Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

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

  const onDelete = async () => {
    const ok = await confirm({
      title: t('form.deleteConfirmTitle'),
      message: t('form.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    weightRepository.remove(entry.id);
    goBackOrHome();
  };

  return (
    <Screen>
      <WeightForm
        unit={unit}
        submitLabel={t('form.saveChanges')}
        defaultValues={{
          weight: String(round(kgTo(unit, entry.weightKg))),
          measuredAt: entry.measuredAt,
          note: entry.note ?? '',
        }}
        onSubmit={async (values) => {
          await save(values, entry.id);
          goBackOrHome();
        }}
      />
      <Button title={t('form.deleteEntry')} variant="ghost" onPress={onDelete} />
    </Screen>
  );
}
