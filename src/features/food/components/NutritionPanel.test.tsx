import type { FoodProduct } from '../domain/product';
import { renderWithProviders, screen } from '@/test/render';
import { NutritionPanel } from './NutritionPanel';

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

describe('NutritionPanel', () => {
  it('shows the EU table in its order: energy, fat, of which saturates, carbohydrate, of which sugars, protein, salt', async () => {
    await renderWithProviders(<NutritionPanel product={nutella} />);
    const page = JSON.stringify(screen.toJSON());
    const order = [
      'Energy',
      'Fat',
      'of which saturates',
      'Carbohydrate',
      'of which sugars',
      'Protein',
      'Salt',
    ].map((name) => page.indexOf(`"${name}"`));
    expect(order).not.toContain(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(screen.queryByText('Fibre')).not.toBeOnTheScreen(); // not given for this product
  });

  it('reads each row as one sentence: name, amount, level, share of the reference intake', async () => {
    await renderWithProviders(<NutritionPanel product={nutella} />);
    expect(
      screen.getByLabelText('Energy, 2,228 kJ / 539 kcal, 27% of the daily reference intake'),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('of which sugars, 56.3 g, High, 63% of the daily reference intake'),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Carbohydrate, 57.5 g, 22% of the daily reference intake'),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Protein, 6.3 g, 13% of the daily reference intake'),
    ).toBeOnTheScreen();
  });

  it('says the EU claim in words on the rows without a colour level', async () => {
    const skyr = {
      ...nutella,
      kcalPer100g: 59,
      kjPer100g: 250,
      proteinPer100g: 10,
      fibrePer100g: 7,
    };
    await renderWithProviders(<NutritionPanel product={skyr} />);
    expect(screen.getByText('High protein')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Fibre, 7 g, High fibre, 28% of the 25 g a day advised (EFSA)'),
    ).toBeOnTheScreen();
  });

  it('shows unknown values as unknown, never as low', async () => {
    await renderWithProviders(<NutritionPanel product={{ ...nutella, saltPer100g: null }} />);
    expect(screen.getByLabelText('Salt, —, Unknown')).toBeOnTheScreen();
  });

  it('is in French with the pack’s French names and number formatting', async () => {
    await renderWithProviders(<NutritionPanel product={nutella} />, { language: 'fr' });
    expect(
      screen.getByLabelText("dont sucres, 56,3 g, Élevé, 63 % de l'apport de référence journalier"),
    ).toBeOnTheScreen();
    expect(screen.getByText('Matières grasses')).toBeOnTheScreen();
    expect(screen.getByText('dont acides gras saturés')).toBeOnTheScreen();
  });

  it('shows mono- and polyunsaturates under fat, indented, with their claim (olive oil)', async () => {
    const oliveOil = {
      ...nutella,
      kcalPer100g: 884,
      kjPer100g: 3637,
      fatPer100g: 100,
      saturatedFatPer100g: 14,
      monounsaturatedFatPer100g: 73,
      polyunsaturatedFatPer100g: 11,
    };
    await renderWithProviders(<NutritionPanel product={oliveOil} />);
    const mono = screen.getByLabelText('of which mono-unsaturates, 73 g, High monounsaturated fat');
    const poly = screen.getByLabelText('of which polyunsaturates, 11 g'); // no claim, no reference intake
    const fat = screen.getByLabelText('Fat, 100 g, High, 143% of the daily reference intake');
    for (const subRow of [mono, poly]) expect(subRow).toHaveStyle({ paddingLeft: 16 });
    expect(fat).toHaveStyle({ paddingLeft: 0 });
  });

  it('says "Low energy" on the energy row of a light product', async () => {
    const cucumber = { ...nutella, kcalPer100g: 12, kjPer100g: 50 };
    await renderWithProviders(<NutritionPanel product={cucumber} />);
    expect(
      screen.getByLabelText(
        'Energy, 50 kJ / 12 kcal, Low energy, 1% of the daily reference intake',
      ),
    ).toBeOnTheScreen();
  });

  it('says the claims in French', async () => {
    const skyr = {
      ...nutella,
      kcalPer100g: 59,
      kjPer100g: 250,
      proteinPer100g: 10,
      fibrePer100g: 3,
    };
    await renderWithProviders(<NutritionPanel product={skyr} />, { language: 'fr' });
    expect(screen.getByText('Riche en protéines')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(
        'Fibres alimentaires, 3 g, Riche en fibres, 12 % des 25 g conseillés par jour (EFSA)',
      ),
    ).toBeOnTheScreen(); // 3 g in 59 kcal: 5 g per 100 kcal
  });
});
