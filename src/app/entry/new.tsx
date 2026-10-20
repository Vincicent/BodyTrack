import { selectWeightUnit } from '@/features/settings';
import { WeightForm } from '@/features/weight/components/WeightForm';
import { useSaveWeight } from '@/features/weight/hooks/useSaveWeight';
import { haptics } from '@/shared/lib/haptics';
import { goBackOrHome } from '@/shared/lib/navigation';
import { Button, Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NewEntryScreen() {
  const { t } = useTranslation();
  const unit = useAppSelector(selectWeightUnit);
  const save = useSaveWeight(unit);
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button title={t('common.cancel')} variant="ghost" onPress={() => goBackOrHome()} />
          ),
        }}
      />
      <Screen>
        <WeightForm
          unit={unit}
          onSubmit={async (values) => {
            await save(values);
            void haptics.success();
            goBackOrHome();
          }}
        />
      </Screen>
    </>
  );
}
