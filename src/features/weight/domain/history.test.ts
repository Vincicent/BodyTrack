import { makeWeight } from '@/test/factories';
import { formatDelta, toHistoryRows } from './history';

const at = (iso: string) => new Date(`${iso}T08:00:00Z`);

describe('toHistoryRows', () => {
  it('returns nothing for no entries', () => expect(toHistoryRows([], 'en')).toEqual([]));

  it('adds a header per month and deltas vs the next older entry', () => {
    const rows = toHistoryRows(
      [
        makeWeight({ id: 3, measuredAt: at('2026-10-03'), weightKg: 79 }),
        makeWeight({ id: 2, measuredAt: at('2026-10-01'), weightKg: 79.5 }),
        makeWeight({ id: 1, measuredAt: at('2026-09-30'), weightKg: 80 }),
      ],
      'en',
    );
    expect(rows.map((r) => (r.type === 'header' ? r.label : r.deltaKg))).toEqual([
      'October 2026',
      -0.5,
      -0.5,
      'September 2026',
      null,
    ]);
    expect(rows.map((r) => r.key)).toEqual(['h-2026-10', 'e-3', 'e-2', 'h-2026-9', 'e-1']);
  });

  it('formats month labels in the locale', () => {
    const [header] = toHistoryRows([makeWeight({ measuredAt: at('2026-10-03') })], 'fr');
    expect(header).toMatchObject({ type: 'header', label: 'octobre 2026' });
  });
});

describe('formatDelta', () => {
  it.each([
    [0.4, 'kg', 'en', '+0.4'],
    [-0.3, 'kg', 'en', '−0.3'],
    [0.04, 'kg', 'en', '+0.04'], // a baby's gain: to 10 g in kg
    [0.004, 'kg', 'en', '±0.0'],
    [0.05, 'lb', 'en', '+0.1'], // lb stays to 0.1 (0.11 lb)
    [3.25 - 3.2, 'kg', 'en', '+0.05'], // floating point: 0.04999… is 0.05
    [-0.3, 'kg', 'fr', '−0,3'],
    [1, 'lb', 'en', '+2.2'],
  ] as const)('formatDelta(%p, %p, %p) = %p', (delta, unit, locale, expected) => {
    expect(formatDelta(delta, unit, locale)).toBe(expected);
  });
  it('returns null without a delta', () => expect(formatDelta(null, 'kg', 'en')).toBeNull());
});
