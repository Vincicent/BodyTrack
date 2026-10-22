import { OpenFoodFactsCredit } from '@/features/food/components/OpenFoodFactsCredit';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Card } from '@/shared/ui';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Linking, Text } from 'react-native';

/** Google Play requires a link to the privacy policy in the app too, not only on the store listing. */
export const PRIVACY_POLICY_URL = 'https://github.com/Vincicent/BodyTrack/blob/main/PRIVACY.md';

/** Settings → About: the version, the privacy policy, and the credits the data licences require. */
export function AboutSection() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Card title={t('about.title')}>
      <AppText>{t('about.version', { version: Constants.expoConfig?.version ?? 'dev' })}</AppText>
      <Text
        accessibilityRole="link"
        onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
        style={{
          color: theme.colors.primary,
          fontSize: theme.fontSize.md,
          textDecorationLine: 'underline',
        }}
      >
        {t('about.privacyPolicy')}
      </Text>
      <OpenFoodFactsCredit />
    </Card>
  );
}
