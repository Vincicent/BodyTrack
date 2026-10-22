import { isValidBarcode, toFoodProduct } from './product';

describe('toFoodProduct', () => {
  it('maps the fields the app needs', () => {
    const json = {
      code: '3017624010701',
      status: 1,
      product: {
        product_name: 'Nutella',
        brands: 'Ferrero, Nutella',
        nutriments: {
          'energy-kcal_100g': 539,
          'energy-kj_100g': 2228,
          fat_100g: 30.9,
          'saturated-fat_100g': 10.6,
          'monounsaturated-fat_100g': 13,
          'polyunsaturated-fat_100g': 6.5,
          carbohydrates_100g: 57.5,
          sugars_100g: 56.3,
          fiber_100g: 3.4,
          proteins_100g: 6.3,
          salt_100g: 0.1075,
        },
        categories_tags: ['en:spreads'],
        nutriscore_grade: 'e',
      },
    };
    expect(toFoodProduct(json)).toEqual({
      barcode: '3017624010701',
      name: 'Nutella',
      brand: 'Ferrero',
      kcalPer100g: 539,
      kjPer100g: 2228,
      fatPer100g: 30.9,
      saturatedFatPer100g: 10.6,
      monounsaturatedFatPer100g: 13,
      polyunsaturatedFatPer100g: 6.5,
      carbohydratePer100g: 57.5,
      sugarsPer100g: 56.3,
      fibrePer100g: 3.4,
      proteinPer100g: 6.3,
      saltPer100g: 0.1075,
      isDrink: false,
      portion: null,
      nutriScore: 'e',
    });
  });
  it('recognises a drink and its portion (a number, or a string with a comma)', () => {
    const drink = (serving_quantity: number | string) =>
      toFoodProduct({
        code: '5449000000996',
        product: { categories_tags: ['en:beverages', 'en:sodas'], serving_quantity },
      });
    expect(drink(330)).toMatchObject({ isDrink: true, portion: 330 });
    expect(drink('33,5')).toMatchObject({ portion: 33.5 });
    expect(drink('one can')).toMatchObject({ portion: null });
    expect(drink(0)).toMatchObject({ portion: null });
  });
  it('keeps only a real Nutri-Score grade', () => {
    const graded = (nutriscore_grade: string) =>
      toFoodProduct({ code: '1', product: { nutriscore_grade } })?.nutriScore;
    expect(graded('B')).toBe('b');
    expect(graded('unknown')).toBeNull();
    expect(graded('not-applicable')).toBeNull();
  });
  it('returns null when the product does not exist', () =>
    expect(
      toFoodProduct({ code: '000', status: 0, status_verbose: 'product not found' }),
    ).toBeNull());
  it('tolerates missing nutriments', () =>
    expect(toFoodProduct({ code: '123', status: 1, product: {} })).toMatchObject({
      name: '123',
      kcalPer100g: null,
    }));
  it('rejects an unexpected shape', () => expect(() => toFoodProduct({ nope: true })).toThrow());
});

describe('isValidBarcode', () => {
  it.each(['12345678', '3017624010701', '012345678905'])('accepts %p', (b) =>
    expect(isValidBarcode(b)).toBe(true),
  );
  it.each(['', 'abc', '123', '3017-624'])('rejects %p', (b) =>
    expect(isValidBarcode(b)).toBe(false),
  );
});
