import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Show notifications even when the app is open. Call once at startup (root layout). */
export function configureNotifications() {
  if (Platform.OS === 'web') return; // no local notifications in browsers
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** Schedules one daily reminder (replacing any previous one). Resolves to false if permission is denied. */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  body: string,
): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'BodyTrack', body, data: { url: '/entry/new' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  return true;
}

export const cancelReminders = () => Notifications.cancelAllScheduledNotificationsAsync();
