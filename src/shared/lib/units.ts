export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const round = (n: number, decimals = 1) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

export function kgTo(unit: WeightUnit, kg: number) {
  return unit === 'kg' ? kg : kg / KG_PER_LB;
}
export function toKg(unit: WeightUnit, value: number) {
  return unit === 'kg' ? value : value * KG_PER_LB;
}
export function cmTo(unit: LengthUnit, cm: number) {
  return unit === 'cm' ? cm : cm / CM_PER_IN;
}
export function toCm(unit: LengthUnit, value: number) {
  return unit === 'cm' ? value : value * CM_PER_IN;
}
