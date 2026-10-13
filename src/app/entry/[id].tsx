import { AppText, Screen } from '@/shared/ui';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('entry.editHeading', { id })}</AppText>
    </Screen>
  );
}
