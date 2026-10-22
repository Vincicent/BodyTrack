import { router } from 'expo-router';
import { makeWeight } from '@/test/factories';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { WeightRow } from './WeightRow';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const row = (deltaKg: number | null, id = 7) =>
  ({
    type: 'entry',
    key: `e-${id}`,
    entry: makeWeight({ id, weightKg: 78.4, measuredAt: new Date('2026-10-12T08:00:00Z') }),
    deltaKg,
  }) as const;

beforeEach(() => jest.clearAllMocks()); // router.push calls must not leak between tests

describe('WeightRow', () => {
  it('shows an up arrow and a plus sign for a gain', async () => {
    await renderWithProviders(<WeightRow row={row(0.4)} unit="kg" onDelete={jest.fn()} />);
    expect(screen.getByText('▲ +0.4')).toBeOnTheScreen();
  });

  it('shows a down arrow and a minus sign for a loss, and says it in words', async () => {
    await renderWithProviders(<WeightRow row={row(-0.3)} unit="kg" onDelete={jest.fn()} />);
    expect(screen.getByText('▼ −0.3')).toBeOnTheScreen();
    expect(screen.getByLabelText(/Down 0\.3 kg/)).toBeOnTheScreen();
  });

  it('shows no delta for the first entry', async () => {
    await renderWithProviders(<WeightRow row={row(null)} unit="kg" onDelete={jest.fn()} />);
    expect(screen.queryByText(/[▲▼]/)).not.toBeOnTheScreen();
  });

  it('opens the entry on press', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<WeightRow row={row(null, 7)} unit="kg" onDelete={jest.fn()} />);
    await user.press(screen.getByLabelText(/78\.4 kg/));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/entry/[id]', params: { id: '7' } });
  });

  it('does not open the entry on a long press (it shows the row actions instead)', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<WeightRow row={row(null, 7)} unit="kg" onDelete={jest.fn()} />);
    await user.longPress(screen.getByLabelText(/78\.4 kg/));
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe('WeightRow swipe action', () => {
  it('swipe → Edit opens the form directly', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<WeightRow row={row(null, 9)} unit="kg" onDelete={jest.fn()} />);
    await user.press(screen.getByRole('button', { name: 'Edit' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/entry/edit/[id]', params: { id: '9' } });
  });

  it('deletes the entry', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    await renderWithProviders(<WeightRow row={row(null, 9)} unit="kg" onDelete={onDelete} />);
    await user.press(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(9);
  });

  it('says when an entry has a photo', async () => {
    const withPhoto = {
      ...row(null),
      entry: makeWeight({ id: 8, weightKg: 78.4, photoUri: 'photos/1.jpg' }),
    };
    await renderWithProviders(<WeightRow row={withPhoto} unit="kg" onDelete={jest.fn()} />);
    expect(screen.getByLabelText(/78\.4 kg, with a photo/)).toBeOnTheScreen();
  });
});
