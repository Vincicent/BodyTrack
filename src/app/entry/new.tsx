import { AppText, Button, Screen } from '@/shared/ui';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NewEntryScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button title={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
          ),
        }}
      />
      <Screen>
        <AppText variant="title">{t('entry.addTitle')}</AppText>
      </Screen>
    </>
  );
}
