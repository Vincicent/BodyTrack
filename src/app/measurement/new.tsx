import { MeasurementForm } from '@/features/measurements/components/MeasurementForm';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { toRows } from '@/features/measurements/domain/measurementForm';
import { selectLengthUnit } from '@/features/settings';
import { goBackOrHome } from '@/shared/lib/navigation';
import { Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';

export default function NewMeasurementScreen() {
  const unit = useAppSelector(selectLengthUnit);
  return (
    <Screen>
      <MeasurementForm
        unit={unit}
        onSubmit={async (values) => {
          measurementRepository.addMany(toRows(values, unit));
          goBackOrHome();
        }}
      />
    </Screen>
  );
}
