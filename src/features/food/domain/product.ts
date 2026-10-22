import { z } from 'zod';

/** What the app needs from a product: a small, stable domain type (the API returns hundreds of fields). */
export type FoodProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  kcalPer100g: number | null;
  /** As printed on the pack when known (it isn't always kcal × 4.184). */
  kjPer100g: number | null;
  fatPer100g: number | null;
  saturatedFatPer100g: number | null;
  /** Optional on packs: often unknown. */
  monounsaturatedFatPer100g: number | null;
  polyunsaturatedFatPer100g: number | null;
  carbohydratePer100g: number | null;
  sugarsPer100g: number | null;
  /** Optional on packs: often unknown. */
  fibrePer100g: number | null;
  proteinPer100g: number | null;
  saltPer100g: number | null;
  /** Drinks use their own thresholds (per 100 ml). */
  isDrink: boolean;
  /** One portion, in g (food) or ml (drink); null when unknown. */
  portion: number | null;
  /** Official French label, computed by Open Food Facts; null when not computed. */
  nutriScore: NutriScore | null;
};

export type NutriScore = 'a' | 'b' | 'c' | 'd' | 'e';
const NUTRI_SCORES: readonly string[] = ['a', 'b', 'c', 'd', 'e'];

// Validate at the boundary: never trust a network response's shape.
const responseSchema = z.object({
  code: z.string(),
  status: z.number().optional(),
  product: z
    .object({
      product_name: z.string().optional(),
      brands: z.string().optional(),
      nutriments: z
        .object({
          'energy-kcal_100g': z.number(),
          'energy-kj_100g': z.number(),
          fat_100g: z.number(),
          'saturated-fat_100g': z.number(),
          'monounsaturated-fat_100g': z.number(),
          'polyunsaturated-fat_100g': z.number(),
          carbohydrates_100g: z.number(),
          sugars_100g: z.number(),
          fiber_100g: z.number(),
          proteins_100g: z.number(),
          salt_100g: z.number(),
        })
        .partial()
        .optional(),
      categories_tags: z.array(z.string()).optional(),
      // a number, sometimes a string ("330"): coerce, and treat anything unusable as unknown
      serving_quantity: z.union([z.number(), z.string()]).optional(),
      nutriscore_grade: z.string().optional(),
    })
    .optional(),
});

/** Raw JSON → FoodProduct, or null when the product doesn't exist. Throws if the shape is invalid. */
export function toFoodProduct(json: unknown): FoodProduct | null {
  const data = responseSchema.parse(json);
  if (!data.product || data.status === 0) return null;
  const n = data.product.nutriments ?? {};
  const grade = data.product.nutriscore_grade?.toLowerCase();
  return {
    barcode: data.code,
    name: data.product.product_name?.trim() || data.code,
    brand: data.product.brands?.split(',')[0]?.trim() || null,
    kcalPer100g: n['energy-kcal_100g'] ?? null,
    kjPer100g: n['energy-kj_100g'] ?? null,
    fatPer100g: n.fat_100g ?? null,
    saturatedFatPer100g: n['saturated-fat_100g'] ?? null,
    monounsaturatedFatPer100g: n['monounsaturated-fat_100g'] ?? null,
    polyunsaturatedFatPer100g: n['polyunsaturated-fat_100g'] ?? null,
    carbohydratePer100g: n.carbohydrates_100g ?? null,
    sugarsPer100g: n.sugars_100g ?? null,
    fibrePer100g: n.fiber_100g ?? null,
    proteinPer100g: n.proteins_100g ?? null,
    saltPer100g: n.salt_100g ?? null,
    isDrink: data.product.categories_tags?.includes('en:beverages') ?? false,
    portion: positiveNumber(data.product.serving_quantity),
    nutriScore: NUTRI_SCORES.includes(grade ?? '') ? (grade as NutriScore) : null, // also 'unknown', 'not-applicable'
  };
}

const positiveNumber = (v: number | string | undefined) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  return n !== undefined && Number.isFinite(n) && n > 0 ? n : null;
};

/** EAN-8, UPC-A (12), EAN-13 or GTIN-14: digits only. */
export const isValidBarcode = (s: string) => /^\d{8}$|^\d{12,14}$/.test(s.trim());
