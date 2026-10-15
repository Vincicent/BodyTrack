import { useTheme } from '@/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.addWeight')}
              hitSlop={12}
              onPress={() => router.push('/entry/new')}
              style={{ paddingHorizontal: 16 }}
            >
              <Ionicons name="add" size={26} color={theme.colors.primary} />
            </Pressable>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: t('tabs.measurements'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
