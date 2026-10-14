import { cmTo, kgTo, round, toCm, toKg } from './units';

describe('weight conversion', () => {
  it('converts kg to lb', () => expect(round(kgTo('lb', 80), 2)).toBe(176.37));
  it('is reversible', () => expect(toKg('lb', kgTo('lb', 72.3))).toBeCloseTo(72.3, 10));
  it('is identity for kg', () => expect(kgTo('kg', 70)).toBe(70));
});

describe('length conversion', () => {
  it('converts cm to in', () => expect(round(cmTo('in', 84))).toBe(33.1));
  it('is reversible', () => expect(toCm('in', cmTo('in', 84))).toBeCloseTo(84, 10));
});
