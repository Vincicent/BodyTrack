import { makeWeight } from '@/test/factories';
import { chartSeries, trendSummary } from './chartSeries';

const at = (iso: string) => new Date(`${iso}T08:00:00Z`);
const NOW = at('2026-10-31');
const entries = [
  makeWeight({ measuredAt: at('2026-08-01'), weightKg: 82 }),
  makeWeight({ measuredAt: at('2026-10-20'), weightKg: 80 }),
  makeWeight({ measuredAt: at('2026-10-10'), weightKg: 81 }),
];

describe('chartSeries', () => {
  it('returns points in ascending order', () => {
    expect(chartSeries(entries, 'ALL', NOW).map((p) => p.weight)).toEqual([82, 81, 80]);
  });
  it('filters by period', () => {
    expect(chartSeries(entries, '1M', NOW).map((p) => p.weight)).toEqual([81, 80]);
    expect(chartSeries(entries, '3M', NOW)).toHaveLength(2); // Aug 1 is more than 90 days before Oct 31
    expect(chartSeries(entries, '1Y', NOW)).toHaveLength(3);
  });
  it('computes the average before filtering', () => {
    const daily = [
      makeWeight({ measuredAt: at('2026-09-29'), weightKg: 90 }),
      makeWeight({ measuredAt: at('2026-10-02'), weightKg: 80 }),
    ];
    const [first] = chartSeries(daily, '1M', NOW);
    expect(first).toMatchObject({ weight: 80, avg: 85 }); // the 09-29 point is outside 1M but still in the 7-day average
  });
  it('is empty without entries', () => expect(chartSeries([], 'ALL', NOW)).toEqual([]));
});

describe('trendSummary', () => {
  it('needs two points', () =>
    expect(trendSummary([{ t: 0, weight: 80, avg: 80 }])).toEqual({ kind: 'notEnough' }));
  it('detects a downward trend', () => {
    const s = trendSummary([
      { t: 0, weight: 80, avg: 80 },
      { t: 30 * 86_400_000, weight: 78, avg: 78.8 },
    ]);
    expect(s).toMatchObject({ kind: 'down', days: 30 });
    expect(s.kind === 'down' && s.kg).toBeCloseTo(1.2);
  });
  it('treats tiny changes as stable', () =>
    expect(
      trendSummary([
        { t: 0, weight: 80, avg: 80 },
        { t: 86_400_000, weight: 80, avg: 80.01 },
      ]),
    ).toEqual({ kind: 'stable', days: 1 }));
});
