import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// No haptics in browsers: one wrapper instead of Platform checks everywhere.
export const haptics = {
  success: () =>
    Platform.OS === 'web'
      ? undefined
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  light: () =>
    Platform.OS === 'web' ? undefined : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};
