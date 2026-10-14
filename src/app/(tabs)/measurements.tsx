import { AppText, Screen } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export default function MeasurementsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('tabs.measurements')}</AppText>
    </Screen>
  );
}
