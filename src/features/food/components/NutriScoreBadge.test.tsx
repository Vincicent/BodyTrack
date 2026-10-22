import { useLocales } from 'expo-localization';
import { renderWithProviders, screen } from '@/test/render';
import { NutriScoreBadge } from './NutriScoreBadge';

// The phone's country decides whether Nutri-Score is shown (the language doesn't)
jest.mock('expo-localization', () => ({
  ...jest.requireActual('expo-localization'),
  useLocales: jest.fn(),
}));
const inRegion = (regionCode: string | null) =>
  jest.mocked(useLocales).mockReturnValue([{ regionCode } as never]);
beforeEach(() => inRegion('FR'));

describe('NutriScoreBadge', () => {
  it('shows the scale in a country that uses it, read as one sentence', async () => {
    await renderWithProviders(<NutriScoreBadge grade="e" />);
    expect(screen.getByLabelText('Nutri-Score E')).toBeOnTheScreen();
  });

  it.each(['DE', 'BE'])('shows it in %s too, whatever the language', async (region) => {
    inRegion(region);
    await renderWithProviders(<NutriScoreBadge grade="e" />);
    expect(screen.getByLabelText('Nutri-Score E')).toBeOnTheScreen();
  });

  it.each(['GB', 'US', 'CA', null])(
    'hides it in %s, where shoppers don’t know it',
    async (region) => {
      inRegion(region);
      await renderWithProviders(<NutriScoreBadge grade="e" />, { language: 'fr' });
      expect(screen.queryByLabelText(/Nutri-Score/)).not.toBeOnTheScreen();
      expect(screen.queryByText('NUTRI-SCORE')).not.toBeOnTheScreen();
    },
  );

  it('shows nothing when the grade is unknown', async () => {
    await renderWithProviders(<NutriScoreBadge grade={null} />);
    expect(screen.queryByText('NUTRI-SCORE')).not.toBeOnTheScreen();
  });
});
