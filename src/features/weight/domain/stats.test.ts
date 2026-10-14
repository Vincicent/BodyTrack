import { makeWeight } from '@/test/factories';
import { bmi, changeOver, goalProgress, movingAverage, sortByDate } from './stats';

const d = (s: string) => new Date(`2026-${s}T08:00:00Z`);
const NOW = d('10-20');

describe('sortByDate', () => {
  it('sorts ascending without mutating the input', () => {
    const input = [makeWeight({ measuredAt: d('10-02') }), makeWeight({ measuredAt: d('10-01') })];
    const sorted = sortByDate(input);
    expect(sorted.map((e) => e.measuredAt)).toEqual([d('10-01'), d('10-02')]);
    expect(input[0]!.measuredAt).toEqual(d('10-02'));
  });
});

describe('movingAverage', () => {
  it('averages the entries of the last 7 days', () => {
    const entries = [
      makeWeight({ measuredAt: d('10-01'), weightKg: 80 }),
      makeWeight({ measuredAt: d('10-02'), weightKg: 78 }),
      makeWeight({ measuredAt: d('10-10'), weightKg: 76 }),
    ];
    expect(movingAverage(entries).map((p) => p.value)).toEqual([80, 79, 76]);
  });
});

describe('changeOver', () => {
  it('returns null without entries', () => expect(changeOver([], 7, NOW)).toBeNull());
  it('returns null without a reference', () =>
    expect(changeOver([makeWeight({ measuredAt: d('10-01'), weightKg: 80 })], 7, NOW)).toBeNull());
  it('computes the change over exactly 7 days', () => {
    const entries = [
      makeWeight({ measuredAt: d('10-01'), weightKg: 80 }),
      makeWeight({ measuredAt: d('10-08'), weightKg: 79 }),
    ];
    expect(changeOver(entries, 7, NOW)).toBeCloseTo(-1);
  });
  it('picks the latest entry at least N days older', () => {
    const entries = [
      makeWeight({ measuredAt: d('10-01'), weightKg: 80 }),
      makeWeight({ measuredAt: d('10-05'), weightKg: 79.5 }),
      makeWeight({ measuredAt: d('10-09'), weightKg: 79 }),
    ];
    expect(changeOver(entries, 7, NOW)).toBeCloseTo(-1);
  });
  it('does not use an older reference when a closer one exists', () => {
    const entries = [
      makeWeight({ measuredAt: d('09-20'), weightKg: 81 }),
      makeWeight({ measuredAt: d('10-01'), weightKg: 80 }),
      makeWeight({ measuredAt: d('10-09'), weightKg: 79 }),
    ];
    expect(changeOver(entries, 7, NOW)).toBeCloseTo(-1);
  });
  it('ignores entries after now', () => {
    const entries = [
      makeWeight({ measuredAt: d('10-01'), weightKg: 80 }),
      makeWeight({ measuredAt: d('10-08'), weightKg: 79 }),
      makeWeight({ measuredAt: d('10-20'), weightKg: 70 }),
    ];
    expect(changeOver(entries, 7, d('10-10'))).toBeCloseTo(-1);
  });
});

describe('goalProgress', () => {
  it.each([
    [80, 75, 70, 0.5],
    [60, 62, 64, 0.5],
    [80, 82, 70, 0],
    [80, 68, 70, 1],
    [70, 70, 70, 1],
  ])('goalProgress(%d, %d, %d) = %d', (start, current, goal, expected) => {
    expect(goalProgress(start, current, goal)).toBeCloseTo(expected);
  });
});

describe('bmi', () => {
  it('computes weight / height²', () => expect(bmi(80, 180)).toBeCloseTo(24.69, 2));
});
