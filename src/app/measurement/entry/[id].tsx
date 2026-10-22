import { MeasurementEntryDetails } from '@/features/measurements/components/MeasurementEntryDetails';
import { selectLengthUnit } from '@/features/settings';
import { useAppSelector } from '@/store/hooks';
import { useLocalSearchParams } from 'expo-router';

/** Tapping a measurement in a site's history opens this: its details, with Edit and Delete. */
export default function MeasurementDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useAppSelector(selectLengthUnit);
  return <MeasurementEntryDetails id={Number(id)} unit={unit} />;
}
