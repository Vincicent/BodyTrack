import { MeasurementForm } from '@/features/measurements/components/MeasurementForm';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { toRows } from '@/features/measurements/domain/measurementForm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { Screen } from '@/shared/ui';

export default function NewMeasurementScreen() {
  return (
    <Screen>
      <MeasurementForm
        unit="cm"
        onSubmit={async (values) => {
          measurementRepository.addMany(toRows(values, 'cm'));
          goBackOrHome();
        }}
      />
    </Screen>
  );
}
