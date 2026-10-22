import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { PrivacySection } from './PrivacySection';

describe('PrivacySection', () => {
  it('sends crash reports by default and says what they contain', async () => {
    await renderWithProviders(<PrivacySection />);
    expect(screen.getByRole('switch', { name: 'Send anonymous crash reports' })).toHaveProp(
      'value',
      true,
    );
    expect(screen.getByText(/never includes your weights, measurements/)).toBeOnTheScreen();
  });

  it('lets the user turn them off', async () => {
    const { store } = await renderWithProviders(<PrivacySection />);
    // A Switch doesn't respond to press(): fire its valueChange event
    await fireEvent(
      screen.getByRole('switch', { name: 'Send anonymous crash reports' }),
      'valueChange',
      false,
    );
    expect(store.getState().settings.crashReports).toBe(false);
  });
});
