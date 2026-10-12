import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Screen } from '@/shared/ui/Screen';
import { View } from 'react-native';

export default function Dashboard() {
  const t = useTheme();
  return (
    <Screen>
      <AppText variant="title">Today</AppText>
            <Card title="Current weight">
        <AppText variant="number">78.4 kg</AppText>
        <AppText variant="caption">▼ −0.6 kg this week</AppText>
      </Card>
      <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
        <Card title="7-day avg" style={{ flex: 1 }}><AppText variant="title">78.7</AppText></Card>
        <Card title="Goal" style={{ flex: 1 }}><AppText variant="title">75.0</AppText></Card>
      </View>
      <Button title="Add weight" onPress={() => {}} />
    </Screen>
  );
}