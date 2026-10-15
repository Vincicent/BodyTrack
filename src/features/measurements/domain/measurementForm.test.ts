import { emptyMeasurementValues, measurementFormSchema, toRows } from './measurementForm';

const measuredAt = new Date('2026-10-01T08:00:00Z');

describe('measurementFormSchema', () => {
  it('requires at least one value', () => {
    const r = measurementFormSchema.safeParse({ measuredAt, values: emptyMeasurementValues() });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues[0]?.message).toBe('errors.atLeastOne');
  });

  it('keeps only the filled sites, converted to cm', () => {
    const r = measurementFormSchema.parse({
      measuredAt,
      values: { ...emptyMeasurementValues(), waist: '33', hips: '98,5' },
    });
    const [waist] = toRows(r, 'in');
    expect(waist?.site).toBe('waist');
    expect(waist?.valueCm).toBeCloseTo(83.82); // floating point: never toBe on computed decimals
    expect(toRows(r, 'cm').map((x) => [x.site, x.valueCm])).toEqual([
      ['waist', 33],
      ['hips', 98.5],
    ]);
  });
});
