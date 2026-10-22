export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const round = (n: number, decimals = 1) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

/**
 * Decimals a weight is shown with: kg to 10 g (a baby's 3.25 kg), lb to 0.1 lb (45 g; more would only show the noise
 * of converting from kg, like 176.37).
 */
export const WEIGHT_DECIMALS: Record<WeightUnit, number> = { kg: 2, lb: 1 };

/** "80.0", "72.5", "3.25" in the user's unit and locale: one decimal at least, a second only when the value has one. */
export function formatWeightNumber(kg: number, unit: WeightUnit, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: WEIGHT_DECIMALS[unit],
  }).format(kgTo(unit, kg));
}

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
