import { makeWeight } from '@/test/factories';
import { act, fireEvent, renderWithProviders, screen } from '@/test/render';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { HistoryList } from './HistoryList';

jest.mock('../hooks/useWeightEntries');
jest.mock('../data/weightRepository', () => ({ weightRepository: { remove: jest.fn() } }));
const mocked = jest.mocked(useWeightEntries);

describe('HistoryList', () => {
  it('shows the error with a retry instead of loading forever', async () => {
    const refresh = jest.fn();
    mocked.mockReturnValue({
      entries: [],
      isLoading: false,
      error: new Error('Disk full'),
      refresh,
    });
    await renderWithProviders(<HistoryList />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('Disk full')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refresh).toHaveBeenCalled();
  });

  it('shows a loader while loading', async () => {
    mocked.mockReturnValue({ entries: [], isLoading: true, error: undefined, refresh: jest.fn() });
    await renderWithProviders(<HistoryList />);
    expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
  });

  it('shows the empty state when there are no entries', async () => {
    mocked.mockReturnValue({ entries: [], isLoading: false, error: undefined, refresh: jest.fn() });
    await renderWithProviders(<HistoryList />);
    expect(screen.getByText('No entries yet')).toBeOnTheScreen();
  });

  it('shows entries grouped by month', async () => {
    mocked.mockReturnValue({
      entries: [makeWeight({ weightKg: 80, measuredAt: new Date('2026-10-03T08:00:00Z') })],
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });
    await renderWithProviders(<HistoryList />);
    // FlashList measures its layout after the first render: wait for the rows with findBy*
    expect(await screen.findByText('October 2026')).toBeOnTheScreen();
    expect(await screen.findByText(/80\.0/)).toBeOnTheScreen();
    // …then it re-renders once more after measuring: let that last pass finish inside act(), or a slow run warns
    // "An update to ForwardRef(FlashList) inside a test was not wrapped in act(...)"
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  });
});
