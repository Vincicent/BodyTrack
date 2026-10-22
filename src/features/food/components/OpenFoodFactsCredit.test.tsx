import { Linking } from 'react-native';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { OpenFoodFactsCredit } from './OpenFoodFactsCredit';

let openURL: jest.SpyInstance;
beforeEach(() => {
  openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
});
afterEach(() => openURL.mockRestore());

describe('OpenFoodFactsCredit (required by the ODbL)', () => {
  it('names the source and the licence', async () => {
    await renderWithProviders(<OpenFoodFactsCredit />);
    expect(
      screen.getByText(
        'Food data from Open Food Facts, available under the Open Database License (ODbL).',
      ),
    ).toBeOnTheScreen();
  });

  it('links to Open Food Facts and to the licence', async () => {
    await renderWithProviders(<OpenFoodFactsCredit />);
    await fireEvent.press(screen.getByText('Open Food Facts'));
    expect(openURL).toHaveBeenLastCalledWith('https://world.openfoodfacts.org');
    await fireEvent.press(screen.getByText('Open Database License'));
    expect(openURL).toHaveBeenLastCalledWith('https://opendatacommons.org/licenses/odbl/1-0/');
  });

  it("links to the product's own page when there is one", async () => {
    await renderWithProviders(<OpenFoodFactsCredit barcode="3017624010701" />);
    await fireEvent.press(screen.getByText('Open Food Facts'));
    expect(openURL).toHaveBeenCalledWith('https://world.openfoodfacts.org/product/3017624010701');
  });

  it('is translated', async () => {
    await renderWithProviders(<OpenFoodFactsCredit />, { language: 'fr' });
    expect(screen.getByText(/Données alimentaires Open Food Facts/)).toBeOnTheScreen();
  });
});
