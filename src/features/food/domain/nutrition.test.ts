import {
  energyClaim,
  fibreClaim,
  nutrientLevel,
  nutritionTable,
  proteinClaim,
  unsaturatedFatClaim,
  usesNutriScore,
  type Level,
  type Nutrient,
} from './nutrition';
import type { FoodProduct } from './product';

const food = { isDrink: false, portion: null };
const drink = { isDrink: true, portion: null };

describe('nutrientLevel: UK front-of-pack thresholds, per 100 g (foods)', () => {
  it.each<[Nutrient, number, Level]>([
    ['fat', 3, 'low'],
    ['fat', 3.1, 'medium'],
    ['fat', 17.5, 'medium'],
    ['fat', 17.6, 'high'],
    ['saturatedFat', 1.5, 'low'],
    ['saturatedFat', 5, 'medium'],
    ['saturatedFat', 5.1, 'high'],
    ['sugars', 5, 'low'],
    ['sugars', 22.5, 'medium'],
    ['sugars', 22.6, 'high'],
    ['salt', 0.3, 'low'],
    ['salt', 1.5, 'medium'],
    ['salt', 1.6, 'high'],
  ])('%s %p g/100 g → %s', (nutrient, per100, level) => {
    expect(nutrientLevel(nutrient, per100, food)).toBe(level);
  });
});

describe('nutrientLevel: drinks have lower thresholds, per 100 ml', () => {
  it.each<[Nutrient, number, Level]>([
    ['fat', 1.5, 'low'],
    ['fat', 8.8, 'high'],
    ['saturatedFat', 0.75, 'low'],
    ['saturatedFat', 2.6, 'high'],
    ['sugars', 2.5, 'low'],
    ['sugars', 11.25, 'medium'],
    ['sugars', 11.3, 'high'],
    ['salt', 0.75, 'medium'],
    ['salt', 0.8, 'high'],
  ])('%s %p g/100 ml → %s', (nutrient, per100, level) => {
    expect(nutrientLevel(nutrient, per100, drink)).toBe(level);
  });
});

describe('nutrientLevel: the portion rule', () => {
  it('rates a 330 ml can of cola high in sugars (35 g in the can), although 10.6 g/100 ml is medium', () => {
    expect(nutrientLevel('sugars', 10.6, { isDrink: true, portion: 330 })).toBe('high');
    expect(nutrientLevel('sugars', 10.6, drink)).toBe('medium');
  });

  it('only applies to portions above 150 ml (drinks) or 100 g (foods)', () => {
    expect(nutrientLevel('sugars', 10.6, { isDrink: true, portion: 150 })).toBe('medium');
    expect(nutrientLevel('fat', 15, { isDrink: false, portion: 100 })).toBe('medium');
    expect(nutrientLevel('fat', 15, { isDrink: false, portion: 150 })).toBe('high'); // 22.5 g > 21 g
  });

  it('is unknown, never "low", when the amount is missing', () => {
    expect(nutrientLevel('salt', null, food)).toBeNull();
  });
});

// Nutella, as Open Food Facts gives it: no fibre, no mono-/polyunsaturates
const nutella: FoodProduct = {
  barcode: '3017624010701',
  name: 'Nutella',
  brand: 'Ferrero',
  kcalPer100g: 539,
  kjPer100g: 2228,
  fatPer100g: 30.9,
  saturatedFatPer100g: 10.6,
  monounsaturatedFatPer100g: null,
  polyunsaturatedFatPer100g: null,
  carbohydratePer100g: 57.5,
  sugarsPer100g: 56.3,
  fibrePer100g: null,
  proteinPer100g: 6.3,
  saltPer100g: 0.1075,
  isDrink: false,
  portion: null,
  nutriScore: 'e',
};

describe('nutritionTable', () => {
  it('lists the rows in the EU order, with levels, claims and shares of the reference intakes', () => {
    expect(nutritionTable(nutella)).toEqual([
      {
        row: 'energy',
        partOfAbove: false,
        per100: 539,
        kj: 2228,
        level: null,
        claim: null,
        percentOfReference: 27,
      },
      {
        row: 'fat',
        partOfAbove: false,
        per100: 30.9,
        level: 'high',
        claim: null,
        percentOfReference: 44,
      },
      {
        row: 'saturatedFat',
        partOfAbove: true,
        per100: 10.6,
        level: 'high',
        claim: null,
        percentOfReference: 53,
      },
      {
        row: 'carbohydrate',
        partOfAbove: false,
        per100: 57.5,
        level: null,
        claim: null,
        percentOfReference: 22,
      },
      {
        row: 'sugars',
        partOfAbove: true,
        per100: 56.3,
        level: 'high',
        claim: null,
        percentOfReference: 63,
      },
      {
        row: 'protein',
        partOfAbove: false,
        per100: 6.3,
        level: null,
        claim: null,
        percentOfReference: 13,
      },
      {
        row: 'salt',
        partOfAbove: false,
        per100: 0.1075,
        level: 'low',
        claim: null,
        percentOfReference: 2,
      },
    ]);
  });

  it('adds the optional rows when the product gives them, in their place', () => {
    const rows = nutritionTable({
      ...nutella,
      monounsaturatedFatPer100g: 13,
      polyunsaturatedFatPer100g: 6.5,
      fibrePer100g: 3.4,
    }).map((r) => r.row);
    expect(rows).toEqual([
      'energy',
      'fat',
      'saturatedFat',
      'monounsaturatedFat',
      'polyunsaturatedFat',
      'carbohydrate',
      'sugars',
      'fibre',
      'protein',
      'salt',
    ]);
  });

  it('gives fibre a share of EFSA’s 25 g a day (the EU has no reference intake for it)', () => {
    const fibre = nutritionTable({ ...nutella, fibrePer100g: 7 }).find((r) => r.row === 'fibre');
    expect(fibre).toMatchObject({ per100: 7, percentOfReference: 28, claim: 'highFibre' });
  });

  it('computes kJ when the product only gives kcal (1 kcal = 4.184 kJ)', () => {
    const [energy] = nutritionTable({ ...nutella, kjPer100g: null });
    expect(energy?.kj).toBe(2255);
  });

  it('keeps unknown values unknown: no level, no claim, no share', () => {
    const rows = nutritionTable({
      ...nutella,
      fatPer100g: null,
      kcalPer100g: null,
      kjPer100g: null,
    });
    expect(rows.find((r) => r.row === 'fat')).toMatchObject({
      per100: null,
      level: null,
      percentOfReference: null,
    });
    expect(rows.find((r) => r.row === 'energy')).toMatchObject({
      per100: null,
      kj: null,
      claim: null,
    });
  });
});

describe('energyClaim (EU "low energy": ≤ 40 kcal/100 g, ≤ 20 kcal/100 ml)', () => {
  it.each([
    [40, false, 'lowEnergy'],
    [41, false, null],
    [20, true, 'lowEnergy'],
    [21, true, null],
  ] as const)('%s kcal, drink: %s → %s', (kcal, isDrink, claim) => {
    expect(energyClaim({ ...nutella, kcalPer100g: kcal, isDrink })).toBe(claim);
  });
});

describe('proteinClaim (EU: high ≥ 20% of the energy from protein, source ≥ 12%)', () => {
  it.each([
    // [protein g, kcal, claim]
    [6.3, 539, null], // Nutella: 5%
    [10, 400, null], // 10%
    [12, 400, 'sourceOfProtein'], // 48 kcal of 400: exactly 12%
    [19.9, 400, 'sourceOfProtein'], // 19.9%: the exact share counts, not a rounded 20%
    [20, 400, 'highProtein'], // exactly 20%
    [10, 59, 'highProtein'], // plain skyr: 68%
  ] as const)('%s g of protein in %s kcal → %s', (protein, kcal, claim) => {
    expect(proteinClaim({ proteinPer100g: protein, kcalPer100g: kcal })).toBe(claim);
  });

  it('makes no claim when protein or energy is unknown, or energy is zero', () => {
    expect(proteinClaim({ proteinPer100g: null, kcalPer100g: 400 })).toBeNull();
    expect(proteinClaim({ proteinPer100g: 20, kcalPer100g: null })).toBeNull();
    expect(proteinClaim({ proteinPer100g: 0, kcalPer100g: 0 })).toBeNull(); // water
  });
});

describe('fibreClaim (EU: high ≥ 6 g/100 g or 3 g/100 kcal; source ≥ 3 g or 1.5 g/100 kcal)', () => {
  it.each([
    [2.9, 400, null],
    [3, 400, 'sourceOfFibre'], // 3 g per 100 g
    [2, 100, 'sourceOfFibre'], // 2 g per 100 kcal (a light food)
    [6, 400, 'highFibre'], // 6 g per 100 g
    [4, 100, 'highFibre'], // 4 g per 100 kcal
    [5.9, 400, 'sourceOfFibre'],
  ] as const)('%s g of fibre in %s kcal → %s', (fibre, kcal, claim) => {
    expect(fibreClaim({ ...nutella, fibrePer100g: fibre, kcalPer100g: kcal })).toBe(claim);
  });

  it('makes no claim when fibre is unknown', () => {
    expect(fibreClaim({ ...nutella, fibrePer100g: null })).toBeNull();
  });

  it('still judges per 100 g when the energy is unknown (the per-100-kcal rule is skipped)', () => {
    expect(fibreClaim({ ...nutella, fibrePer100g: 6, kcalPer100g: null })).toBe('highFibre');
    expect(fibreClaim({ ...nutella, fibrePer100g: 3, kcalPer100g: null })).toBe('sourceOfFibre');
    expect(fibreClaim({ ...nutella, fibrePer100g: 2, kcalPer100g: null })).toBeNull();
  });
});

describe('unsaturatedFatClaim (EU: ≥ 45% of the fatty acids, and more than 20% of the energy)', () => {
  // Olive oil, per 100 g: 884 kcal, 14 g saturates, 73 g mono, 11 g poly
  const oliveOil = {
    ...nutella,
    kcalPer100g: 884,
    fatPer100g: 100,
    saturatedFatPer100g: 14,
    monounsaturatedFatPer100g: 73,
    polyunsaturatedFatPer100g: 11,
  };

  it('olive oil is high in monounsaturated fat, not in polyunsaturated fat', () => {
    expect(unsaturatedFatClaim('monounsaturated', oliveOil)).toBe('highMonounsaturatedFat');
    expect(unsaturatedFatClaim('polyunsaturated', oliveOil)).toBeNull(); // 11% of the fatty acids
  });

  it('needs more than 20% of the energy: a little fat, even mostly unsaturated, is not enough', () => {
    // 1 g of mono in 100 kcal: 9% of the energy
    const light = {
      ...oliveOil,
      kcalPer100g: 100,
      saturatedFatPer100g: 0.2,
      monounsaturatedFatPer100g: 1,
      polyunsaturatedFatPer100g: 0.2,
    };
    expect(unsaturatedFatClaim('monounsaturated', light)).toBeNull();
  });

  it('sunflower oil is high in polyunsaturated fat', () => {
    // Per 100 g: 884 kcal, 11 g saturates, 20 g mono, 66 g poly
    const sunflowerOil = {
      ...oliveOil,
      saturatedFatPer100g: 11,
      monounsaturatedFatPer100g: 20,
      polyunsaturatedFatPer100g: 66,
    };
    expect(unsaturatedFatClaim('polyunsaturated', sunflowerOil)).toBe('highPolyunsaturatedFat');
    expect(unsaturatedFatClaim('monounsaturated', sunflowerOil)).toBeNull(); // 21% of the fatty acids
  });

  it('makes no claim when the energy is unknown, or there are no fatty acids at all', () => {
    expect(unsaturatedFatClaim('monounsaturated', { ...oliveOil, kcalPer100g: null })).toBeNull();
    const noFat = {
      ...oliveOil,
      saturatedFatPer100g: 0,
      monounsaturatedFatPer100g: 0,
      polyunsaturatedFatPer100g: 0,
    };
    expect(unsaturatedFatClaim('monounsaturated', noFat)).toBeNull();
  });

  it('makes no claim when one of the three fatty acids is unknown', () => {
    expect(
      unsaturatedFatClaim('monounsaturated', { ...oliveOil, polyunsaturatedFatPer100g: null }),
    ).toBeNull();
  });
});

describe('usesNutriScore', () => {
  it.each(['FR', 'BE', 'DE', 'ES', 'LU', 'NL', 'CH', 'PT', 'fr'])('%s: yes', (region) => {
    expect(usesNutriScore(region)).toBe(true);
  });
  it.each(['GB', 'US', 'CA', 'IT', null, undefined, ''])('%s: no', (region) => {
    expect(usesNutriScore(region)).toBe(false);
  });
});
