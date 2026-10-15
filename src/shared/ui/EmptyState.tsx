import { useTheme } from '@/shared/theme/useTheme';
import { router, type Href } from 'expo-router';
import { View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = { title: string; message?: string; action?: { label: string; href: Href } };

export function EmptyState({ title, message, action }: Props) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.spacing.md,
        padding: t.spacing.xl,
      }}
    >
      <AppText variant="title" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          {message}
        </AppText>
      ) : null}
      {action ? <Button title={action.label} onPress={() => router.push(action.href)} /> : null}
    </View>
  );
}
