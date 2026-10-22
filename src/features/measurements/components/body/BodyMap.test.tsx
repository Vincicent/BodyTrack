import { router } from 'expo-router';
import { act, fireEvent, renderWithProviders, screen, userEvent } from '@/test/render';
import type { MeasurementEntry } from '../../domain/measurement';
import { summarizeSites } from '../../domain/siteSummary';
import { BodyMap } from './BodyMap';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
beforeEach(() => jest.clearAllMocks());

const m = (site: MeasurementEntry['site'], valueCm: number, day: number): MeasurementEntry => ({
  id: day * 100 + valueCm,
  site,
  valueCm,
  measuredAt: new Date(Date.UTC(2026, 9, day, 8)),
  note: null,
});
const summaries = summarizeSites([m('waist', 84, 1), m('waist', 82, 20), m('calfL', 37, 20)]);

/** The map measures its width before drawing (like on a phone): give it one. */
async function renderMap(language?: 'fr') {
  await renderWithProviders(<BodyMap summaries={summaries} unit="cm" />, { language });
  await act(async () =>
    fireEvent(screen.getByTestId('body-map'), 'layout', {
      nativeEvent: { layout: { width: 358, height: 0, x: 0, y: 0 } },
    }),
  );
}

describe('BodyMap', () => {
  it('shows every site, measured or not, as a button', async () => {
    await renderMap();
    expect(screen.getAllByRole('button')).toHaveLength(10);
  });

  it('reads a measured site as one sentence: name, latest value, change since the start', async () => {
    await renderMap();
    expect(
      screen.getByRole('button', { name: 'Waist, 82.0 cm. −2.0 cm since start' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Calf (L), 37.0 cm' })).toBeOnTheScreen(); // measured once: no change
  });

  it('says when a site was never measured, and shows no made-up value', async () => {
    await renderMap();
    expect(screen.getByRole('button', { name: 'Calf (R), not measured yet' })).toBeOnTheScreen();
    expect(screen.getAllByText('—')).toHaveLength(8); // 10 sites, 2 measured (waist, left calf)
  });

  it('opens the history of a measured site', async () => {
    const user = userEvent.setup();
    await renderMap();
    await user.press(screen.getByRole('button', { name: /^Waist/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/measurement/[site]',
      params: { site: 'waist' },
    });
  });

  it('opens the form for a site never measured', async () => {
    const user = userEvent.setup();
    await renderMap();
    await user.press(screen.getByRole('button', { name: /^Neck/ }));
    expect(router.push).toHaveBeenCalledWith('/measurement/new');
  });

  it('is in French, with D / G for the sides', async () => {
    await renderMap('fr');
    expect(screen.getByRole('button', { name: 'Mollet (D), pas encore mesuré' })).toBeOnTheScreen();
    expect(screen.getByText('Taille')).toBeOnTheScreen();
  });

  it('draws nothing until it knows its width (no layout jump)', async () => {
    await renderWithProviders(<BodyMap summaries={summaries} unit="cm" />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
