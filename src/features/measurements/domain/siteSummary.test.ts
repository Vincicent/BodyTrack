import type { MeasurementEntry } from './measurement';
import { formatLength, formatLengthChange, siteChartPoints, summarizeSites } from './siteSummary';

let id = 0;
const m = (site: MeasurementEntry['site'], valueCm: number, day: number): MeasurementEntry => ({
  id: ++id,
  site,
  valueCm,
  measuredAt: new Date(Date.UTC(2026, 9, day, 8)),
  note: null,
});

describe('summarizeSites', () => {
  it('keeps the latest value per site and the change since the first one, in body order', () => {
    const summary = summarizeSites([m('hips', 98.5, 5), m('waist', 84, 5), m('waist', 87.5, 1)]);
    expect(summary.map((s) => s.site)).toEqual(['waist', 'hips']); // waist comes before hips
    expect(summary[0]).toMatchObject({ latest: { valueCm: 84 }, changeCm: -3.5 });
  });

  it('has no change for a site measured once, and leaves out sites never measured', () => {
    const summary = summarizeSites([m('neck', 38, 2)]);
    expect(summary).toEqual([expect.objectContaining({ site: 'neck', changeCm: null })]);
  });

  it('is empty without measurements', () => {
    expect(summarizeSites([])).toEqual([]);
  });
});

describe('formatLength / formatLengthChange', () => {
  it('formats in the user unit and locale', () => {
    expect(formatLength(84, 'cm', 'en')).toBe('84.0 cm');
    expect(formatLength(84, 'in', 'fr')).toBe('33,1 in');
  });

  it('signs the change, with a real minus sign', () => {
    expect(formatLengthChange(-3.5, 'cm', 'en')).toBe('−3.5 cm');
    expect(formatLengthChange(1, 'cm', 'en')).toBe('+1.0 cm');
    expect(formatLengthChange(0, 'cm', 'en')).toBe('±0.0 cm');
    expect(formatLengthChange(null, 'cm', 'en')).toBeNull();
  });
});

describe('siteChartPoints', () => {
  it('returns the points oldest first, in the user unit', () => {
    const points = siteChartPoints([m('waist', 84, 5), m('waist', 87.5, 1)], 'in');
    expect(points?.map((p) => p.value)).toEqual([34.4, 33.1]);
    expect(points![0]!.t).toBeLessThan(points![1]!.t);
  });

  it('keeps one point per day: the last measurement of that day', () => {
    const evening = { ...m('neck', 22, 19), measuredAt: new Date(Date.UTC(2026, 9, 19, 20)) };
    const points = siteChartPoints([m('neck', 33, 17), m('neck', 11, 19), evening], 'cm');
    expect(points?.map((p) => p.value)).toEqual([33, 22]); // 11 (morning) is replaced by 22 (evening)
  });

  it('has nothing to draw with one measurement, or with several on the same day', () => {
    expect(siteChartPoints([m('waist', 84, 5)], 'cm')).toBeNull();
    expect(siteChartPoints([m('waist', 84, 5), m('waist', 85, 5)], 'cm')).toBeNull();
    expect(siteChartPoints([], 'cm')).toBeNull();
  });
});
