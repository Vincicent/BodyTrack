import { settingsSlice } from '@/features/settings';
import { renderWithProviders, screen } from '@/test/render';
import { Text } from 'react-native';
import { useFormatWeight } from './useFormatWeight';

function WeightValue({ kg }: { kg: number }) {
  const format = useFormatWeight();
  return <Text testID="value">{format(kg)}</Text>;
}
const initial = settingsSlice.getInitialState();
// Intl may use a non-breaking space in some locales: normalise before comparing
const shown = () => String(screen.getByTestId('value').props.children).replace(/\s/g, ' ');

describe('useFormatWeight', () => {
  it('formats in kg by default', async () => {
    await renderWithProviders(<WeightValue kg={72.5} />);
    expect(shown()).toBe('72.5 kg');
  });

  it('converts to pounds', async () => {
    await renderWithProviders(<WeightValue kg={80} />, {
      preloadedState: { settings: { ...initial, weightUnit: 'lb' } },
    });
    expect(shown()).toBe('176.4 lb');
  });

  it('uses a decimal comma in French', async () => {
    await renderWithProviders(<WeightValue kg={72.5} />, { language: 'fr' });
    expect(shown()).toBe('72,5 kg');
  });
});
