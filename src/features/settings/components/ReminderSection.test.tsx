import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { scheduleDailyReminder } from '../reminders';
import { ReminderSection } from './ReminderSection';

jest.mock('../reminders', () => ({ scheduleDailyReminder: jest.fn(), cancelReminders: jest.fn() }));
const schedule = jest.mocked(scheduleDailyReminder);

describe('ReminderSection', () => {
  it('turns the reminder on when permission is granted', async () => {
    schedule.mockResolvedValue(true);
    const { store } = await renderWithProviders(<ReminderSection />);
    // A Switch doesn't respond to press(): fire its valueChange event
    await fireEvent(screen.getByRole('switch', { name: 'Daily reminder' }), 'valueChange', true);
    expect(schedule).toHaveBeenCalledWith(8, 0, expect.any(String));
    expect(store.getState().settings.reminder.enabled).toBe(true);
  });

  it('explains and offers the settings when permission is denied', async () => {
    schedule.mockResolvedValue(false);
    const { store } = await renderWithProviders(<ReminderSection />);
    // A Switch doesn't respond to press(): fire its valueChange event
    await fireEvent(screen.getByRole('switch', { name: 'Daily reminder' }), 'valueChange', true);
    expect(store.getState().settings.reminder.enabled).toBe(false);
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeOnTheScreen();
  });
});
