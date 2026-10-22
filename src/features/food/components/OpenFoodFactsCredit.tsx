import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';
import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { Linking, Text } from 'react-native';

export const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org';
export const ODBL_URL = 'https://opendatacommons.org/licenses/odbl/1-0/';

function Link({ url, children }: { url: string; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}
    >
      {children}
    </Text>
  );
}

/**
 * "Data from Open Food Facts, available under the Open Database License": the ODbL requires crediting the source and
 * naming the licence, and Open Food Facts asks apps to do it in the UI, with links (food screens, About).
 * With a barcode, "Open Food Facts" opens that product's page, where its data can be checked or corrected.
 */
export function OpenFoodFactsCredit({ barcode }: { barcode?: string }) {
  const source = barcode
    ? `${OPEN_FOOD_FACTS_URL}/product/${encodeURIComponent(barcode)}`
    : OPEN_FOOD_FACTS_URL;
  return (
    <AppText variant="caption">
      <Trans
        i18nKey="food.credit"
        // Tag names matter: <source> would be read as HTML's empty <source> element, and the link would lose its text
        components={{ off: <Link url={source} />, odbl: <Link url={ODBL_URL} /> }}
      />
    </AppText>
  );
}
