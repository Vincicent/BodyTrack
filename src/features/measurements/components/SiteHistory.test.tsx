import { renderWithProviders, screen } from '@/test/render';
import type { MeasurementEntry } from '../domain/measurement';
import { useMeasurements } from '../hooks/useMeasurements';
import { SiteHistory } from './SiteHistory';

jest.mock('../hooks/useMeasurements');
const mocked = jest.mocked(useMeasurements);
const m = (valueCm: number, day: number): MeasurementEntry => ({
  id: day,
  site: 'waist',
  valueCm,
  measuredAt: new Date(Date.UTC(2026, 9, day, 8)),
  note: null,
});

describe('SiteHistory', () => {
  it('lists the site, newest first, with the change from the previous measurement', async () => {
    mocked.mockReturnValue({
      entries: [m(84, 5), m(85, 3), m(87.5, 1)], // newest first, like the repository
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<SiteHistory site="waist" unit="in" />);
    expect(mocked).toHaveBeenCalledWith('waist'); // only this site is queried
    expect(screen.getByText('33.1 in')).toBeOnTheScreen();
    expect(screen.getByText('−0.4 in')).toBeOnTheScreen(); // 84 − 85 cm
    expect(screen.getByText('−1.0 in')).toBeOnTheScreen(); // 85 − 87.5 cm
  });
});
