import { renderWithProviders, screen, userEvent } from '@/test/render';
import { FoodLookup } from './FoodLookup';

// A phone set to France, where Nutri-Score is used (NutriScoreBadge.test covers the other countries)
// The app's version comes from app.json in a real build; Jest has no app config, so give it one
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0' } },
}));
jest.mock('expo-localization', () => ({
  ...jest.requireActual('expo-localization'),
  useLocales: jest.fn(() => [{ regionCode: 'FR' }]),
}));

// The real scanner needs a camera: replace it by a button that "scans" a known barcode.
jest.mock('./BarcodeScanner', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    CAN_SCAN: true,
    BarcodeScanner: ({
      onScanned,
      onClose,
    }: {
      onScanned: (b: string) => void;
      onClose: () => void;
    }) => (
      <>
        <Pressable accessibilityRole="button" onPress={() => onScanned('3017624010701')}>
          <Text>fake camera</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text>close fake camera</Text>
        </Pressable>
      </>
    ),
  };
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Mock the network at the boundary: `fetch`. The API layer, the validation and the UI states are all real.
let fetchMock: jest.SpyInstance;
beforeEach(() => {
  fetchMock = jest.spyOn(globalThis, 'fetch');
});
afterEach(() => fetchMock.mockRestore());

async function search(barcode: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Barcode'), barcode);
  await user.press(screen.getByRole('button', { name: 'Look up' }));
}

describe('FoodLookup', () => {
  it('credits Open Food Facts on the lookup screen, and links the product page once found', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '3017624010701',
        status: 1,
        product: { product_name: 'Nutella', nutriments: {} },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    expect(screen.getByText('Open Food Facts')).toBeOnTheScreen(); // before any lookup
    await search('3017624010701');
    await screen.findByText('Nutella');
    expect(screen.getByText('Open Food Facts')).toBeOnTheScreen();
  });

  it('shows the product', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '3017624010701',
        status: 1,
        product: {
          product_name: 'Nutella',
          brands: 'Ferrero',
          nutriments: { 'energy-kcal_100g': 539 },
        },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('3017624010701');
    expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    expect(screen.getByText('2,255 kJ / 539 kcal')).toBeOnTheScreen(); // kJ computed: the response has kcal only
  });

  it('identifies the app to Open Food Facts: name, version and a contact', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: '3017624010701', status: 0 }));
    await renderWithProviders(<FoodLookup />);
    await search('3017624010701');
    await screen.findByText(/No product found/);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.headers.get('X-User-Agent')).toBe('BodyTrack/1.0.0 (vincicent.dev@gmail.com)');
  });

  it('rates a drink per 100 ml, with the portion rule (a 330 ml can of cola is high in sugars)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '5449000000996',
        status: 1,
        product: {
          product_name: 'Coca-Cola',
          categories_tags: ['en:beverages'],
          serving_quantity: 330,
          nutriments: { fat_100g: 0, 'saturated-fat_100g': 0, sugars_100g: 10.6, salt_100g: 0 },
        },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('5449000000996');
    expect(await screen.findByText('Per 100 ml')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^of which sugars, 10\.6 g, High/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Fat, 0 g, Low/)).toBeOnTheScreen();
  });

  it('scans a barcode and looks the product up straight away', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      jsonResponse({ code: '3017624010701', status: 1, product: { product_name: 'Nutella' } }),
    );
    await renderWithProviders(<FoodLookup />);
    await user.press(screen.getByRole('button', { name: 'Scan a barcode' }));
    await user.press(screen.getByRole('button', { name: 'fake camera' }));
    expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    expect(screen.getByLabelText('Barcode')).toHaveDisplayValue('3017624010701'); // typed entry stays in sync
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ url: expect.stringContaining('3017624010701') }),
    );
  });

  it('says when the product does not exist', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: '12345678', status: 0 }));
    await renderWithProviders(<FoodLookup />);
    await search('12345678');
    expect(await screen.findByText('No product found for this barcode.')).toBeOnTheScreen();
  });

  it('shows an error and retries', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await renderWithProviders(<FoodLookup />);
    await search('12345678');
    expect(await screen.findByText(/Couldn't reach the food database/)).toBeOnTheScreen();

    fetchMock.mockResolvedValue(
      jsonResponse({ code: '12345678', status: 1, product: { product_name: 'Oats' } }),
    );
    await userEvent.setup().press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Oats')).toBeOnTheScreen();
  });

  it('disables the search for an invalid barcode', async () => {
    await renderWithProviders(<FoodLookup />);
    await userEvent.setup().type(screen.getByLabelText('Barcode'), '123');
    expect(screen.getByRole('button', { name: 'Look up' })).toBeDisabled();
  });

  it('the ✕ clears the barcode and removes the product it found', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      jsonResponse({ code: '3017624010701', status: 1, product: { product_name: 'Nutella' } }),
    );
    await renderWithProviders(<FoodLookup />);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeOnTheScreen(); // empty field: no ✕
    await search('3017624010701');
    expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Barcode')).toHaveDisplayValue('');
    expect(screen.queryByText('Nutella')).not.toBeOnTheScreen();
  });

  it('hides a result as soon as the barcode no longer matches it', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      jsonResponse({ code: '3017624010701', status: 1, product: { product_name: 'Nutella' } }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('3017624010701');
    expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Barcode'), '9');
    expect(screen.queryByText('Nutella')).not.toBeOnTheScreen();
  });

  it('says "High protein" on the protein row when protein gives at least 20% of the energy (EU rule)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '3033491279012',
        status: 1,
        product: {
          product_name: 'Skyr',
          nutriments: { 'energy-kcal_100g': 59, proteins_100g: 10 },
        },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('3033491279012');
    expect(
      await screen.findByLabelText(
        'Protein, 10 g, High protein, 20% of the daily reference intake',
      ),
    ).toBeOnTheScreen();
  });

  it('makes no protein claim below 12% of the energy', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '3017624010701',
        status: 1,
        product: {
          product_name: 'Nutella',
          nutriments: { 'energy-kcal_100g': 539, proteins_100g: 6.3 },
        },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('3017624010701');
    expect(
      await screen.findByLabelText('Protein, 6.3 g, 13% of the daily reference intake'),
    ).toBeOnTheScreen();
  });

  it('shows the brand, the name, the Nutri-Score, then the nutrition values', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: '3017624010701',
        status: 1,
        product: {
          product_name: 'Nutella',
          brands: 'Ferrero',
          nutriscore_grade: 'e',
          nutriments: { 'energy-kcal_100g': 539, proteins_100g: 6.3, fat_100g: 30.9 },
        },
      }),
    );
    await renderWithProviders(<FoodLookup />);
    await search('3017624010701');
    await screen.findByText('Nutella');
    const page = JSON.stringify(screen.toJSON());
    const order = ['Ferrero', 'Nutella', 'NUTRI-SCORE', 'Energy', 'Fat', 'Protein'].map((text) =>
      page.indexOf(`"${text}"`),
    );
    expect(order).not.toContain(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('closing the camera brings the scan button back, without looking anything up', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<FoodLookup />);
    await user.press(screen.getByRole('button', { name: 'Scan a barcode' }));
    expect(screen.queryByRole('button', { name: 'Scan a barcode' })).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'close fake camera' }));
    expect(screen.getByRole('button', { name: 'Scan a barcode' })).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
