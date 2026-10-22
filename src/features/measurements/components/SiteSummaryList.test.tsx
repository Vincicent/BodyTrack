import { fireEvent, renderWithProviders, screen, userEvent } from '@/test/render';
import { router } from 'expo-router';
import type { MeasurementEntry } from '../domain/measurement';
import { useMeasurements } from '../hooks/useMeasurements';
import { SiteSummaryList } from './SiteSummaryList';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useMeasurements');
const mocked = jest.mocked(useMeasurements);
const loaded = (entries: MeasurementEntry[]) => ({
  entries,
  isLoading: false,
  error: undefined,
  refresh: jest.fn(),
});
const m = (site: MeasurementEntry['site'], valueCm: number, day: number): MeasurementEntry => ({
  id: day * 100 + valueCm,
  site,
  valueCm,
  measuredAt: new Date(Date.UTC(2026, 9, day, 8)),
  note: null,
});

beforeEach(() => jest.clearAllMocks());

describe('SiteSummaryList', () => {
  it('shows the empty state without measurements', async () => {
    mocked.mockReturnValue(loaded([]));
    await renderWithProviders(<SiteSummaryList unit="cm" />);
    expect(screen.getByText('No measurements yet')).toBeOnTheScreen();
  });

  it('shows the latest value per site and the change since the start', async () => {
    mocked.mockReturnValue(loaded([m('waist', 84, 5), m('waist', 87.5, 1), m('hips', 98.5, 5)]));
    await renderWithProviders(<SiteSummaryList unit="cm" />);
    expect(screen.getByText('84.0 cm')).toBeOnTheScreen();
    expect(screen.getByText('▼ −3.5 cm since start')).toBeOnTheScreen();
    expect(screen.getByText('98.5 cm')).toBeOnTheScreen(); // a single measurement: no change line
    expect(screen.getByLabelText('Waist, 84.0 cm. −3.5 cm since start')).toBeOnTheScreen();
  });

  it('opens the site screen on press', async () => {
    const user = userEvent.setup();
    mocked.mockReturnValue(loaded([m('hips', 98.5, 5)]));
    await renderWithProviders(<SiteSummaryList unit="cm" />);
    await user.press(screen.getByLabelText(/^Hips/));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/measurement/[site]',
      params: { site: 'hips' },
    });
  });
});

describe('SiteSummaryList error state', () => {
  it('shows the error with a retry instead of loading forever', async () => {
    const refresh = jest.fn();
    mocked.mockReturnValue({
      entries: [],
      isLoading: false,
      error: new Error('Disk full'),
      refresh,
    });
    await renderWithProviders(<SiteSummaryList unit="cm" />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refresh).toHaveBeenCalled();
  });
});
