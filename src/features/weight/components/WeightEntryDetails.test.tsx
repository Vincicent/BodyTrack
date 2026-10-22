import { router } from 'expo-router';
import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { makeWeight } from '@/test/factories';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { deleteWeightEntry } from '../data/deleteWeightEntry';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { WeightEntryDetails } from './WeightEntryDetails';

// The header's Edit button: render Stack.Screen's headerRight so the test can press it
jest.mock('expo-router', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    router: { push: jest.fn() },
    Stack: {
      Screen: ({ options }: { options: { headerRight?: () => React.ReactNode } }) => (
        <View>{options.headerRight?.()}</View>
      ),
    },
  };
});
jest.mock('../hooks/useWeightEntries');
jest.mock('../data/deleteWeightEntry', () => ({ deleteWeightEntry: jest.fn() }));
jest.mock('../data/photos', () => ({ photoUri: (p: string) => `file:///documents/${p}` }));
jest.mock('@/shared/lib/confirm', () => ({ confirm: jest.fn() }));
jest.mock('@/shared/lib/navigation', () => ({ goBackOrHome: jest.fn() }));

const entries = [
  makeWeight({
    id: 2,
    weightKg: 78.4,
    measuredAt: new Date('2026-10-12T08:00:00Z'),
    note: 'after holidays',
    photoUri: 'photos/2.jpg',
  }),
  makeWeight({ id: 1, weightKg: 79, measuredAt: new Date('2026-10-05T08:00:00Z') }),
];
const loaded = { entries, isLoading: false, error: undefined, refresh: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useWeightEntries).mockReturnValue(loaded);
});

describe('WeightEntryDetails', () => {
  it('shows the photo, weight, change from the previous entry and note', async () => {
    await renderWithProviders(<WeightEntryDetails id={2} unit="kg" />);
    expect(screen.getByLabelText('Progress photo')).toBeOnTheScreen();
    expect(screen.getByText('78.4 kg')).toBeOnTheScreen();
    expect(screen.getByText('−0.6 kg since the previous one')).toBeOnTheScreen();
    expect(screen.getByText('after holidays')).toBeOnTheScreen();
  });

  it('says when it is the first entry, without a photo', async () => {
    await renderWithProviders(<WeightEntryDetails id={1} unit="kg" />);
    expect(screen.getByText('First entry')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Progress photo')).toBeNull();
  });

  it('opens the form from the header Edit button', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<WeightEntryDetails id={2} unit="kg" />);
    await user.press(screen.getByRole('button', { name: 'Edit' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/entry/edit/[id]', params: { id: '2' } });
  });

  it('deletes the entry (and its photo) after confirmation, then goes back', async () => {
    const user = userEvent.setup();
    jest.mocked(confirm).mockResolvedValue(true);
    await renderWithProviders(<WeightEntryDetails id={2} unit="kg" />);
    await user.press(screen.getByRole('button', { name: 'Delete entry' }));
    expect(deleteWeightEntry).toHaveBeenCalledWith(2);
    expect(goBackOrHome).toHaveBeenCalled();
  });

  it('keeps the entry when the deletion is cancelled', async () => {
    const user = userEvent.setup();
    jest.mocked(confirm).mockResolvedValue(false);
    await renderWithProviders(<WeightEntryDetails id={2} unit="kg" />);
    await user.press(screen.getByRole('button', { name: 'Delete entry' }));
    expect(deleteWeightEntry).not.toHaveBeenCalled();
  });

  it('says so when the entry no longer exists', async () => {
    await renderWithProviders(<WeightEntryDetails id={99} unit="kg" />);
    expect(screen.queryByText('78.4 kg')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });
});
