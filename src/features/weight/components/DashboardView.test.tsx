import { settingsSlice } from '@/features/settings';
import { makeWeight } from '@/test/factories';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { DashboardView } from './DashboardView';

jest.mock('../hooks/useWeightEntries');
jest.mock('./WeightChart', () => ({ WeightChart: () => null })); // Skia never loads in Jest
const mocked = jest.mocked(useWeightEntries);
const initial = settingsSlice.getInitialState();
const day = (n: number) => new Date(Date.UTC(2026, 9, n, 8));

beforeEach(() => jest.useFakeTimers({ now: day(20) }));
afterEach(() => jest.useRealTimers());

const twoWeeks = [
  makeWeight({ measuredAt: day(19), weightKg: 79 }),
  makeWeight({ measuredAt: day(17), weightKg: 80 }),
  makeWeight({ measuredAt: day(5), weightKg: 80 }),
];

describe('DashboardView', () => {
  it('shows the error with a retry instead of loading forever', async () => {
    const refresh = jest.fn();
    mocked.mockReturnValue({
      entries: [],
      isLoading: false,
      error: new Error('Disk full'),
      refresh,
    });
    await renderWithProviders(<DashboardView />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the empty state without entries', async () => {
    mocked.mockReturnValue({ entries: [], isLoading: false, error: undefined, refresh: jest.fn() });
    await renderWithProviders(<DashboardView />);
    expect(screen.getByText('No entries yet')).toBeOnTheScreen();
  });

  it('shows the latest weight and the 7-day change', async () => {
    mocked.mockReturnValue({
      entries: twoWeeks,
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<DashboardView />);
    expect(screen.getByText('79.0 kg')).toBeOnTheScreen();
    expect(screen.getByText(/−1\.0/)).toBeOnTheScreen();
  });

  it('shows goal progress only when a goal is set', async () => {
    mocked.mockReturnValue({
      entries: twoWeeks,
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<DashboardView />);
    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();

    await renderWithProviders(<DashboardView />, {
      preloadedState: { settings: { ...initial, goalKg: 70 } },
    });
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('shows the BMI only when the height is set', async () => {
    mocked.mockReturnValue({
      entries: twoWeeks,
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<DashboardView />, {
      preloadedState: { settings: { ...initial, heightCm: 180 } },
    });
    expect(screen.getByText('BMI')).toBeOnTheScreen();
    expect(screen.getByText('24.4')).toBeOnTheScreen();
  });

  it('describes the chart in words for screen readers', async () => {
    mocked.mockReturnValue({
      entries: twoWeeks,
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<DashboardView />);
    expect(screen.getByLabelText(/Weight trend: down/)).toBeOnTheScreen();
  });
});
