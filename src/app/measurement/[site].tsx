import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SiteHistory } from '@/features/measurements/components/SiteHistory';
import { isMeasurementSite } from '@/shared/lib/measurementSites';
import { AppText, Screen } from '@/shared/ui';

export default function SiteScreen() {
  const { site } = useLocalSearchParams<{ site: string }>();
  const { t } = useTranslation();
  // The URL can contain anything (deep link, typed URL): check it before using it.
  if (!site || !isMeasurementSite(site)) {
    return (
      <Screen>
        <AppText>{t('notFound.message')}</AppText>
      </Screen>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: t(`sites.${site}`) }} />
      <SiteHistory site={site} unit="cm" />
    </>
  );
}
