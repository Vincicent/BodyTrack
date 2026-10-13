import { useTheme } from '@/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: t.colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History',
        tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="measurements" options={{ title: 'Measurements',
        tabBarIcon: ({ color, size }) => <Ionicons name="body-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings',
        tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}