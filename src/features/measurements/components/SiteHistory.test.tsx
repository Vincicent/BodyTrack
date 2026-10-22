import { TrendChart } from '@/shared/ui/charts/TrendChart';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import type { MeasurementEntry } from '../domain/measurement';
import { useMeasurements } from '../hooks/useMeasurements';
import { SiteHistory } from './SiteHistory';

jest.mock('../hooks/useMeasurements');
jest.mock('@/shared/ui/charts/TrendChart', () => ({ TrendChart: jest.fn(() => null) })); // Skia never loads in Jest
const chart = jest.mocked(TrendChart);
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

describe('SiteHistory chart', () => {
  beforeEach(() => chart.mockClear());

  const loaded = (entries: MeasurementEntry[]) => ({
    entries,
    isLoading: false,
    error: undefined,
    refresh: jest.fn(),
  });

  it('draws the chart from two different days', async () => {
    mocked.mockReturnValue(loaded([m(84, 5), m(87.5, 1)]));
    await renderWithProviders(<SiteHistory site="waist" unit="cm" />);
    expect(chart.mock.lastCall?.[0].data).toHaveLength(2);
  });

  it('shows a hint instead with a single measurement', async () => {
    mocked.mockReturnValue(loaded([m(84, 5)]));
    await renderWithProviders(<SiteHistory site="waist" unit="cm" />);
    expect(screen.getByText('Add one more entry to see your trend.')).toBeOnTheScreen();
    expect(chart).not.toHaveBeenCalled();
  });
});

describe('SiteHistory error state', () => {
  it('shows the error with a retry instead of loading forever', async () => {
    const refresh = jest.fn();
    mocked.mockReturnValue({
      entries: [],
      isLoading: false,
      error: new Error('Disk full'),
      refresh,
    });
    await renderWithProviders(<SiteHistory site="waist" unit="cm" />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refresh).toHaveBeenCalled();
  });
});
