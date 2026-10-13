import { Stack, useLocalSearchParams } from 'expo-router';
import { AppText, Screen } from '@/shared/ui';

export default function SiteScreen() {
  const { site } = useLocalSearchParams<{ site: string }>();
  return (
    <>
      <Stack.Screen options={{ title: site }} />
      <Screen>
        <AppText variant="title">{site}</AppText>
      </Screen>
    </>
  );
}