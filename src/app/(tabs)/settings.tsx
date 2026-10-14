import { AppText, Screen } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('tabs.settings')}</AppText>
    </Screen>
  );
}
