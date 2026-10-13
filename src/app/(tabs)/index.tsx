import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Card, Screen } from '@/shared/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function Dashboard() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('dashboard.title')}</AppText>
      <Card title={t('dashboard.currentWeight')}>
        <AppText variant="number">78.4 kg</AppText>
        <AppText variant="caption">▼ −0.6 kg</AppText>
      </Card>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Card title={t('dashboard.sevenDayAvg')} style={{ flex: 1 }}>
          <AppText variant="title">78.7</AppText>
        </Card>
        <Card title={t('dashboard.goal')} style={{ flex: 1 }}>
          <AppText variant="title">75.0</AppText>
        </Card>
      </View>
      <Button title={t('dashboard.addWeight')} onPress={() => router.push('/entry/new')} />
    </Screen>
  );
}
