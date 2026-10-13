import { AppText, Screen } from '@/shared/ui';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <Screen>
        <AppText variant="title">{t('notFound.message')}</AppText>
        <Link href="/">{t('notFound.back')}</Link>
      </Screen>
    </>
  );
}
