import * as Notifications from 'expo-notifications';
import { scheduleDailyReminder } from './reminders';

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));
const N = jest.mocked(Notifications);

beforeEach(() => jest.clearAllMocks());

describe('scheduleDailyReminder', () => {
  it('schedules a daily notification at the chosen time', async () => {
    N.requestPermissionsAsync.mockResolvedValue({ granted: true } as never);
    await expect(scheduleDailyReminder(7, 30, 'Weigh in')).resolves.toBe(true);
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalled(); // no duplicates
    expect(N.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({ type: 'daily', hour: 7, minute: 30 }),
      }),
    );
  });

  it('does nothing when permission is denied', async () => {
    N.requestPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await expect(scheduleDailyReminder(7, 30, 'Weigh in')).resolves.toBe(false);
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
