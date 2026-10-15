import type { MeasurementEntry } from './measurement';
import { formatLength, formatLengthChange, summarizeSites } from './siteSummary';

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
