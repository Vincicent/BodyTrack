import { Linking } from 'react-native';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { AboutSection } from './AboutSection';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.0' } },
}));

describe('AboutSection', () => {
  it('shows the version and credits Open Food Facts with its licence', async () => {
    await renderWithProviders(<AboutSection />);
    expect(screen.getByText('BodyTrack 1.2.0')).toBeOnTheScreen();
    expect(screen.getByText('Open Food Facts')).toBeOnTheScreen();
    expect(screen.getByText('Open Database License')).toBeOnTheScreen();
  });

  it('links to the privacy policy (Google Play requires it in the app)', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderWithProviders(<AboutSection />);
    await fireEvent.press(screen.getByRole('link', { name: 'Privacy policy' }));
    expect(openURL).toHaveBeenCalledWith(
      'https://github.com/Vincicent/BodyTrack/blob/main/PRIVACY.md',
    );
    openURL.mockRestore();
  });
});
