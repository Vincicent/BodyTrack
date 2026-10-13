import { AppText, Button, Screen } from '@/shared/ui';
import { Stack, router } from 'expo-router';

export default function NewEntryScreen() {
  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <Button title="Cancel" variant="ghost" onPress={() => router.back()} /> }}
      />
      <Screen>
        <AppText variant="title">Add weight</AppText>
      </Screen>
    </>
  );
}