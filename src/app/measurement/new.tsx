import { AppText, Screen } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export default function NewMeasurementScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('tabs.addTitle')}</AppText>
    </Screen>
  );
}
