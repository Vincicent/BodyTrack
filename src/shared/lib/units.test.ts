import { cmTo, formatWeightNumber, kgTo, round, toCm, toKg } from './units';

describe('weight conversion', () => {
  it('converts kg to lb', () => expect(round(kgTo('lb', 80), 2)).toBe(176.37));
  it('is reversible', () => expect(toKg('lb', kgTo('lb', 72.3))).toBeCloseTo(72.3, 10));
  it('is identity for kg', () => expect(kgTo('kg', 70)).toBe(70));
});

describe('length conversion', () => {
  it('converts cm to in', () => expect(round(cmTo('in', 84))).toBe(33.1));
  it('is reversible', () => expect(toCm('in', cmTo('in', 84))).toBeCloseTo(84, 10));
});

describe('formatWeightNumber', () => {
  it.each([
    [80, 'kg', 'en', '80.0'], // one decimal at least
    [72.5, 'kg', 'en', '72.5'],
    [3.25, 'kg', 'en', '3.25'], // a baby: the second decimal when the value has one
    [3.25, 'kg', 'fr', '3,25'],
    [80, 'lb', 'en', '176.4'], // lb: one decimal, not the conversion noise (176.37)
  ] as const)('formatWeightNumber(%p, %p, %p) = %p', (kg, unit, locale, expected) => {
    expect(formatWeightNumber(kg, unit, locale)).toBe(expected);
  });
});
