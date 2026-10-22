import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button } from '@/shared/ui';
import { acceptScan, FOOD_BARCODE_TYPES } from '../domain/scan';

/** iOS/Android have a camera scanner; the web version of this file says false. */
export const CAN_SCAN = true;

type Props = { onScanned: (barcode: string) => void; onClose: () => void };

/** Camera preview that reports ONE barcode, with the permission flow (system dialog, refused, open Settings). */
export function BarcodeScanner({ onScanned, onClose }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const lastAccepted = useRef<string | null>(null);
  const asked = useRef(false);

  // The user just tapped "Scan": show the system's camera dialog straight away (no in-app "Allow" step before it).
  // Refused → back to typing the barcode.
  const mustAsk = permission !== null && !permission.granted && permission.canAskAgain;
  useEffect(() => {
    if (!mustAsk || asked.current) return;
    asked.current = true;
    void requestPermission().then((answer) => {
      if (!answer.granted) onClose();
    });
  }, [mustAsk, requestPermission, onClose]);

  if (!permission || mustAsk) return null; // reading the permission, or the system dialog is open
  if (!permission.granted) {
    // Refused for good: the system won't ask again, only the Settings can turn the camera back on
    return (
      <View style={{ gap: theme.spacing.sm }}>
        <AppText>{t('food.cameraDenied')}</AppText>
        <Button title={t('food.openSettings')} onPress={() => void Linking.openSettings()} />
        <Button title={t('common.cancel')} variant="ghost" onPress={onClose} />
      </View>
    );
  }
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <CameraView
        style={{ height: 240, borderRadius: theme.radius.md, overflow: 'hidden' }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...FOOD_BARCODE_TYPES] }}
        onBarcodeScanned={({ data }) => {
          const barcode = acceptScan(data, lastAccepted.current);
          if (!barcode) return;
          lastAccepted.current = barcode;
          onScanned(barcode);
        }}
        accessibilityLabel={t('food.scanHint')}
      />
      <AppText variant="caption">{t('food.scanHint')}</AppText>
      <Button title={t('food.closeScanner')} variant="ghost" onPress={onClose} />
    </View>
  );
}
