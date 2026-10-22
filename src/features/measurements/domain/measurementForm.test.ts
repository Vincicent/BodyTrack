import {
  emptyMeasurementValues,
  measurementEntryFormSchema,
  measurementFormSchema,
  toRows,
} from './measurementForm';

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

describe('measurementEntryFormSchema (editing one measurement)', () => {
  it('reads a decimal with a comma or a dot', () => {
    expect(measurementEntryFormSchema.parse({ value: '82,5', measuredAt }).value).toBe(82.5);
    expect(measurementEntryFormSchema.parse({ value: ' 82.5 ', measuredAt }).value).toBe(82.5);
  });

  it.each([
    ['', 'errors.required'], // to remove a value, delete the measurement
    ['abc', 'errors.notANumber'],
    ['0', 'errors.positive'],
  ])('rejects %p with %s', (value, message) => {
    const r = measurementEntryFormSchema.safeParse({ value, measuredAt });
    expect(!r.success && r.error.issues[0]?.message).toBe(message);
  });

  it('rejects a date in the future', () => {
    const r = measurementEntryFormSchema.safeParse({
      value: '82',
      measuredAt: new Date(Date.now() + 86_400_000),
    });
    expect(!r.success && r.error.issues[0]?.message).toBe('errors.futureDate');
  });
});
