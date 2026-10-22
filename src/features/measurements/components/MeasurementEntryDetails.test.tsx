import { router } from 'expo-router';
import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { makeMeasurement } from '@/test/factories';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { measurementRepository } from '../data/measurementRepository';
import { useMeasurements } from '../hooks/useMeasurements';
import { MeasurementEntryDetails } from './MeasurementEntryDetails';

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
jest.mock('../hooks/useMeasurements');
jest.mock('../data/measurementRepository', () => ({
  measurementRepository: { remove: jest.fn() },
}));
jest.mock('@/shared/lib/confirm', () => ({ confirm: jest.fn() }));
jest.mock('@/shared/lib/navigation', () => ({ goBackOrHome: jest.fn() }));

// every site, newest first: the previous WAIST is id 1, not the neck in between
const entries = [
  makeMeasurement({
    id: 3,
    site: 'waist',
    valueCm: 84,
    measuredAt: new Date('2026-10-12T08:00:00Z'),
  }),
  makeMeasurement({
    id: 2,
    site: 'neck',
    valueCm: 38,
    measuredAt: new Date('2026-10-08T08:00:00Z'),
  }),
  makeMeasurement({
    id: 1,
    site: 'waist',
    valueCm: 86,
    measuredAt: new Date('2026-10-05T08:00:00Z'),
  }),
];

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useMeasurements)
    .mockReturnValue({ entries, isLoading: false, error: undefined, refresh: jest.fn() });
});

describe('MeasurementEntryDetails', () => {
  it('shows the value and the change from the previous measurement of the same site', async () => {
    await renderWithProviders(<MeasurementEntryDetails id={3} unit="cm" />);
    expect(screen.getByText('84.0 cm')).toBeOnTheScreen();
    expect(screen.getByText(/−2\.0 cm since the previous one/)).toBeOnTheScreen();
  });

  it('opens the form from the header Edit button', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MeasurementEntryDetails id={3} unit="cm" />);
    await user.press(screen.getByRole('button', { name: 'Edit' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/measurement/edit/[id]',
      params: { id: '3' },
    });
  });

  it('deletes after confirmation, then goes back', async () => {
    const user = userEvent.setup();
    jest.mocked(confirm).mockResolvedValue(true);
    await renderWithProviders(<MeasurementEntryDetails id={3} unit="cm" />);
    await user.press(screen.getByRole('button', { name: 'Delete entry' }));
    expect(measurementRepository.remove).toHaveBeenCalledWith(3);
    expect(goBackOrHome).toHaveBeenCalled();
  });
});
