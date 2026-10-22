import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Card } from '@/shared/ui';
import { TextField } from '@/shared/ui/TextField';
import { useLazyGetProductQuery } from '../api/foodApi';
import { isValidBarcode } from '../domain/product';
import { BarcodeScanner, CAN_SCAN } from './BarcodeScanner';
import { NutritionPanel } from './NutritionPanel';
import { NutriScoreBadge } from './NutriScoreBadge';

export function FoodLookup() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lookup, { data, isFetching, isError, isSuccess, originalArgs }] = useLazyGetProductQuery();
  const valid = isValidBarcode(barcode);
  // A result belongs to the barcode it was looked up for: clearing the field, or typing another code, hides it
  const current = originalArgs !== undefined && barcode.trim() === originalArgs;

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {CAN_SCAN && !scanning ? (
        <Button title={t('food.scan')} onPress={() => setScanning(true)} />
      ) : null}
      {scanning ? (
        <BarcodeScanner
          onScanned={(code) => {
            setScanning(false);
            setBarcode(code);
            void lookup(code, true);
          }}
          onClose={() => setScanning(false)}
        />
      ) : null}
      <TextField
        label={t('food.barcode')}
        testID="barcode-input" // E2E selector: the label and the input share the same name
        keyboardType="number-pad"
        value={barcode}
        onChangeText={setBarcode}
        onClear={() => setBarcode('')}
      />
      <Button
        title={t('food.search')}
        disabled={!valid || isFetching}
        onPress={() => void lookup(barcode.trim(), true)}
      />

      {isFetching ? (
        <ActivityIndicator accessibilityLabel="Loading" color={theme.colors.primary} />
      ) : null}

      {current && isError && !isFetching ? (
        <Card>
          <AppText accessibilityLiveRegion="polite">{t('food.error')}</AppText>
          <Button
            title={t('food.retry')}
            variant="ghost"
            onPress={() => originalArgs && void lookup(originalArgs, false)}
          />
        </Card>
      ) : null}

      {current && isSuccess && !isFetching && data === null ? (
        <AppText>{t('food.notFound')}</AppText>
      ) : null}

      {current && isSuccess && !isFetching && data ? (
        <Card title={data.brand ?? t('food.unknownBrand')}>
          <AppText variant="title">{data.name}</AppText>
          {/* The overall grade first, then the detail: the nutrition table */}
          <NutriScoreBadge grade={data.nutriScore} />
          <AppText variant="caption">{t(data.isDrink ? 'food.per100ml' : 'food.per100g')}</AppText>
          <NutritionPanel product={data} />
        </Card>
      ) : null}
    </View>
  );
}
