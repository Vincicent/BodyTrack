import { selectWeightUnit } from '@/features/settings';
import { WeightEntryDetails } from '@/features/weight/components/WeightEntryDetails';
import { useAppSelector } from '@/store/hooks';
import { useLocalSearchParams } from 'expo-router';

/** Tapping a row in the Weight log opens this: the entry's details, with Edit and Delete. */
export default function EntryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useAppSelector(selectWeightUnit);
  return <WeightEntryDetails id={Number(id)} unit={unit} />;
}
