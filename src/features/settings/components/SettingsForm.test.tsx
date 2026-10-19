import { renderWithProviders, screen, userEvent } from '@/test/render';
import { SettingsForm } from './SettingsForm';

describe('SettingsForm', () => {
  it('switches to pounds', async () => {
    const user = userEvent.setup();
    const { store } = await renderWithProviders(<SettingsForm />);
    await user.press(screen.getByRole('button', { name: 'lb' }));
    expect(store.getState().settings.weightUnit).toBe('lb');
    expect(screen.getByRole('button', { name: 'lb' })).toBeSelected();
  });

  it('switches the theme to dark', async () => {
    const user = userEvent.setup();
    const { store } = await renderWithProviders(<SettingsForm />);
    await user.press(screen.getByRole('button', { name: 'Dark' }));
    expect(store.getState().settings.theme).toBe('dark');
  });
});
