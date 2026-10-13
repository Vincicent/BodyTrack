import { AppText, Screen } from '@/shared/ui';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops' }} />
      <Screen>
        <AppText variant="title">This screen doesn&apos;t exist.</AppText>
        <Link href="/">Go to the dashboard</Link>
      </Screen>
    </>
  );
}