import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MeasurementForm } from '@/features/measurements/components/MeasurementForm';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { toRows } from '@/features/measurements/domain/measurementForm';
import { Button, Screen } from '@/shared/ui';
import { selectLengthUnit } from '@/features/settings';
import { useAppSelector } from '@/store/hooks';
import { goBackOrHome } from '@/shared/lib/navigation';

export default function NewMeasurementScreen() {
  const { t } = useTranslation();
  const unit = useAppSelector(selectLengthUnit);
  return (
    <>
      {/* Like "Add weight": a modal needs a visible way out (Android and web have no swipe-down) */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button title={t('common.cancel')} variant="ghost" onPress={() => goBackOrHome()} />
          ),
        }}
      />
      <Screen>
        <MeasurementForm
          unit={unit}
          onSubmit={async (values) => {
            measurementRepository.addMany(toRows(values, unit));
            goBackOrHome();
          }}
        />
      </Screen>
    </>
  );
}
