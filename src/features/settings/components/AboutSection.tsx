import { OpenFoodFactsCredit } from '@/features/food/components/OpenFoodFactsCredit';
import { AppText, Card } from '@/shared/ui';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

/** Settings → About: the version, and the credits the data licences require. */
export function AboutSection() {
  const { t } = useTranslation();
  return (
    <Card title={t('about.title')}>
      <AppText>{t('about.version', { version: Constants.expoConfig?.version ?? 'dev' })}</AppText>
      <OpenFoodFactsCredit />
    </Card>
  );
}
