import { AppText, Screen } from '@/shared/ui';
import { useLocalSearchParams } from 'expo-router';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <AppText variant="title">Edit entry #{id}</AppText>
    </Screen>
  );
}