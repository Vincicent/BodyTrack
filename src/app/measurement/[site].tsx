import { SiteHistory } from '@/features/measurements/components/SiteHistory';
import { selectLengthUnit } from '@/features/settings';
import { isMeasurementSite } from '@/shared/lib/measurementSites';
import { AppText, Screen } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function SiteScreen() {
  const { site } = useLocalSearchParams<{ site: string }>();
  const { t } = useTranslation();
  const unit = useAppSelector(selectLengthUnit);
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
      <SiteHistory site={site} unit={unit} />
    </>
  );
}
