import type { FoodProduct } from './product';

export type Nutrient = 'fat' | 'saturatedFat' | 'sugars' | 'salt';
export type Level = 'low' | 'medium' | 'high';
export const NUTRIENTS: readonly Nutrient[] = ['fat', 'saturatedFat', 'sugars', 'salt'];

type Criteria = { low: number; high: number; highPerPortion: number };

/**
 * UK front-of-pack colour coding ("traffic lights"): Department of Health & Food Standards Agency, "Guide to creating a
 * front of pack (FoP) nutrition label", updated November 2016, Tables 2 and 3. Grams per 100 g (foods) / 100 ml (drinks):
 * low ≤ `low`, medium ≤ `high`, high above. A portion above 100 g (food) or 150 ml (drink) is also high when it
 * contains more than `highPerPortion` grams.
 */
const FOOD: Record<Nutrient, Criteria> = {
  fat: { low: 3, high: 17.5, highPerPortion: 21 },
  saturatedFat: { low: 1.5, high: 5, highPerPortion: 6 },
  sugars: { low: 5, high: 22.5, highPerPortion: 27 },
  salt: { low: 0.3, high: 1.5, highPerPortion: 1.8 },
};
const DRINK: Record<Nutrient, Criteria> = {
  fat: { low: 1.5, high: 8.75, highPerPortion: 10.5 },
  saturatedFat: { low: 0.75, high: 2.5, highPerPortion: 3 },
  sugars: { low: 2.5, high: 11.25, highPerPortion: 13.5 },
  salt: { low: 0.3, high: 0.75, highPerPortion: 0.9 },
};
const PORTION_RULE_ABOVE = { food: 100, drink: 150 };

/** EU reference intakes for an average adult, per day (Regulation (EU) No 1169/2011, Annex XIII, Part B). */
export const REFERENCE_INTAKE = {
  energy: 2000, // kcal (8 400 kJ)
  fat: 70,
  saturatedFat: 20,
  carbohydrate: 260,
  sugars: 90,
  protein: 50,
  salt: 6,
} as const;

/**
 * Fibre has no EU reference intake: EFSA's adequate intake for adults instead (Scientific Opinion on dietary reference
 * values for carbohydrates and dietary fibre, EFSA Journal 2010;8(3):1462).
 */
export const FIBRE_ADEQUATE_INTAKE = 25;

/** Low / medium / high for one nutrient; null when the amount is unknown (never guess "low"). */
export function nutrientLevel(
  nutrient: Nutrient,
  per100: number | null,
  { isDrink, portion }: { isDrink: boolean; portion: number | null },
): Level | null {
  if (per100 === null) return null;
  const c = (isDrink ? DRINK : FOOD)[nutrient];
  const portionRuleAbove = isDrink ? PORTION_RULE_ABOVE.drink : PORTION_RULE_ABOVE.food;
  if (
    portion !== null &&
    portion > portionRuleAbove &&
    (per100 * portion) / 100 > c.highPerPortion
  ) {
    return 'high'; // e.g. a 330 ml can of cola: 10.6 g/100 ml is "medium", but 35 g in the can is high
  }
  if (per100 <= c.low) return 'low';
  if (per100 <= c.high) return 'medium';
  return 'high';
}

/** The rows of the EU nutrition declaration, in its order (Regulation (EU) No 1169/2011, Annex XV). */
export type Row =
  | 'energy'
  | 'fat'
  | 'saturatedFat'
  | 'monounsaturatedFat'
  | 'polyunsaturatedFat'
  | 'carbohydrate'
  | 'sugars'
  | 'fibre'
  | 'protein'
  | 'salt';

/** Nutrition claims allowed in the EU (Regulation (EC) No 1924/2006, Annex), for the rows without a colour level. */
export type Claim =
  | 'lowEnergy'
  | 'highMonounsaturatedFat'
  | 'highPolyunsaturatedFat'
  | 'sourceOfFibre'
  | 'highFibre'
  | 'sourceOfProtein'
  | 'highProtein';

export type NutritionRow = {
  row: Row;
  /** An "of which" row: part of the row above (saturates in fat, sugars in carbohydrate). */
  partOfAbove: boolean;
  /** Per 100 g / 100 ml: kcal for energy, grams otherwise; null when unknown. */
  per100: number | null;
  /** Energy only: kJ, as printed on the pack when known. */
  kj?: number | null;
  /** The official colour level: fat, saturates, sugars and salt only. */
  level: Level | null;
  claim: Claim | null;
  /** Share of the daily reference intake, rounded; null when unknown or without a reference. */
  percentOfReference: number | null;
};

// kcal per gram (Regulation (EU) No 1169/2011, Annex XIV); 1 kcal = 4.184 kJ
const KCAL_PER_GRAM = { fat: 9, protein: 4 };
const KJ_PER_KCAL = 4.184;

const percentOf = (amount: number | null, reference: number) =>
  amount === null ? null : Math.round((amount / reference) * 100);

/** Share of the product's energy given by `grams` of a nutrient; null when unknown. */
const energyShare = (grams: number | null, kcalPerGram: number, kcal: number | null) =>
  grams === null || kcal === null || kcal <= 0 ? null : (grams * kcalPerGram) / kcal;

/** "Low energy": at most 40 kcal per 100 g (solids), 20 kcal per 100 ml (liquids). */
export function energyClaim({ kcalPer100g, isDrink }: FoodProduct): Claim | null {
  return kcalPer100g !== null && kcalPer100g <= (isDrink ? 20 : 40) ? 'lowEnergy' : null;
}

/** Protein claims: "high" from 20% of the energy, "source of" from 12%. The exact share: 19.9% is not "high". */
export function proteinClaim(
  product: Pick<FoodProduct, 'proteinPer100g' | 'kcalPer100g'>,
): Claim | null {
  const share = energyShare(product.proteinPer100g, KCAL_PER_GRAM.protein, product.kcalPer100g);
  if (share === null) return null;
  if (share >= 0.2) return 'highProtein';
  if (share >= 0.12) return 'sourceOfProtein';
  return null;
}

/** Fibre claims: "high" from 6 g per 100 g or 3 g per 100 kcal, "source of" from 3 g or 1.5 g per 100 kcal. */
export function fibreClaim({ fibrePer100g, kcalPer100g }: FoodProduct): Claim | null {
  if (fibrePer100g === null) return null;
  const per100kcal =
    kcalPer100g !== null && kcalPer100g > 0 ? (fibrePer100g / kcalPer100g) * 100 : 0;
  if (fibrePer100g >= 6 || per100kcal >= 3) return 'highFibre';
  if (fibrePer100g >= 3 || per100kcal >= 1.5) return 'sourceOfFibre';
  return null;
}

/**
 * "High monounsaturated / polyunsaturated fat": at least 45% of the fatty acids, and more than 20% of the energy.
 * The fatty acids are counted as saturates + mono- + polyunsaturates (packs don't give trans fats): no claim when one
 * of the three is unknown.
 */
export function unsaturatedFatClaim(
  kind: 'monounsaturated' | 'polyunsaturated',
  p: FoodProduct,
): Claim | null {
  const {
    saturatedFatPer100g: sat,
    monounsaturatedFatPer100g: mono,
    polyunsaturatedFatPer100g: poly,
  } = p;
  if (sat === null || mono === null || poly === null) return null;
  const grams = kind === 'monounsaturated' ? mono : poly;
  const fattyAcids = sat + mono + poly;
  const share = energyShare(grams, KCAL_PER_GRAM.fat, p.kcalPer100g);
  if (fattyAcids <= 0 || share === null) return null;
  if (grams / fattyAcids >= 0.45 && share > 0.2) {
    return kind === 'monounsaturated' ? 'highMonounsaturatedFat' : 'highPolyunsaturatedFat';
  }
  return null;
}

/**
 * The product's nutrition table, in the EU order. Fat, saturates, sugars and salt get their colour level; the other
 * rows get an EU claim when one applies. Mono- and polyunsaturates and fibre are optional on packs: shown only when known.
 */
export function nutritionTable(p: FoodProduct): NutritionRow[] {
  const traffic = (row: Nutrient, per100: number | null, partOfAbove = false): NutritionRow => ({
    row,
    partOfAbove,
    per100,
    level: nutrientLevel(row, per100, p),
    claim: null,
    percentOfReference: percentOf(per100, REFERENCE_INTAKE[row]),
  });
  const rows: (NutritionRow | null)[] = [
    {
      row: 'energy',
      partOfAbove: false,
      per100: p.kcalPer100g,
      kj: p.kjPer100g ?? (p.kcalPer100g === null ? null : Math.round(p.kcalPer100g * KJ_PER_KCAL)),
      level: null,
      claim: energyClaim(p),
      percentOfReference: percentOf(p.kcalPer100g, REFERENCE_INTAKE.energy),
    },
    traffic('fat', p.fatPer100g),
    traffic('saturatedFat', p.saturatedFatPer100g, true),
    p.monounsaturatedFatPer100g === null
      ? null
      : {
          row: 'monounsaturatedFat',
          partOfAbove: true,
          per100: p.monounsaturatedFatPer100g,
          level: null,
          claim: unsaturatedFatClaim('monounsaturated', p),
          percentOfReference: null, // no reference intake
        },
    p.polyunsaturatedFatPer100g === null
      ? null
      : {
          row: 'polyunsaturatedFat',
          partOfAbove: true,
          per100: p.polyunsaturatedFatPer100g,
          level: null,
          claim: unsaturatedFatClaim('polyunsaturated', p),
          percentOfReference: null,
        },
    {
      row: 'carbohydrate',
      partOfAbove: false,
      per100: p.carbohydratePer100g,
      level: null,
      claim: null, // no colour level and no EU claim for carbohydrate
      percentOfReference: percentOf(p.carbohydratePer100g, REFERENCE_INTAKE.carbohydrate),
    },
    traffic('sugars', p.sugarsPer100g, true),
    p.fibrePer100g === null
      ? null
      : {
          row: 'fibre',
          partOfAbove: false,
          per100: p.fibrePer100g,
          level: null,
          claim: fibreClaim(p),
          percentOfReference: percentOf(p.fibrePer100g, FIBRE_ADEQUATE_INTAKE),
        },
    {
      row: 'protein',
      partOfAbove: false,
      per100: p.proteinPer100g,
      level: null,
      claim: proteinClaim(p),
      percentOfReference: percentOf(p.proteinPer100g, REFERENCE_INTAKE.protein),
    },
    traffic('salt', p.saltPer100g),
  ];
  return rows.filter((r): r is NutritionRow => r !== null);
}

/**
 * Countries whose health authorities adopted Nutri-Score: the 7 of its joint governance (since 2021), plus Portugal
 * (2024). Elsewhere it means nothing to shoppers, so the app doesn't show it.
 */
export const NUTRI_SCORE_COUNTRIES: readonly string[] = [
  'FR',
  'BE',
  'DE',
  'ES',
  'LU',
  'NL',
  'CH',
  'PT',
];

/** True when the phone's region (ISO 3166 code, e.g. "FR") uses Nutri-Score. */
export const usesNutriScore = (region: string | null | undefined) =>
  !!region && NUTRI_SCORE_COUNTRIES.includes(region.toUpperCase());
