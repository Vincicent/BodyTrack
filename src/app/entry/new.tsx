import { WeightForm } from '@/features/weight/components/WeightForm';
import { useSaveWeight } from '@/features/weight/hooks/useSaveWeight';
import { goBackOrHome } from '@/shared/lib/navigation';
import { Button, Screen } from '@/shared/ui';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NewEntryScreen() {
  const { t } = useTranslation();
  const save = useSaveWeight('kg'); // lesson 10: the user's unit
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
          unit="kg"
          onSubmit={async (values) => {
            await save(values);
            goBackOrHome();
          }}
        />
      </Screen>
    </>
  );
}
