import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button } from '@/shared/ui';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { PHOTOS_SUPPORTED, photoUri, pickProgressPhoto } from '../data/photos';
import type { PhotoValue } from '../domain/photo';

type Props = { value: PhotoValue; onChange: (value: PhotoValue) => void };

/** The progress photo of a weight entry: pick, preview, change or remove. Hidden on the web (no photo storage). */
export function PhotoField({ value, onChange }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!PHOTOS_SUPPORTED) return null;

  const uri = value ? ('picked' in value ? value.picked : photoUri(value.stored)) : null;
  const pick = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const picked = await pickProgressPhoto();
      if (picked) onChange({ picked });
    } catch {
      setFailed(true); // an unreadable file: say so, keep the current photo
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="caption">{t('photo.label')}</AppText>
      {uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel={t('photo.label')}
          contentFit="cover"
          style={{ width: 150, height: 200, borderRadius: theme.radius.md }}
        />
      ) : null}
      {failed ? <AppText variant="caption">{t('photo.error')}</AppText> : null}
      <Button
        title={uri ? t('photo.change') : t('photo.add')}
        variant="ghost"
        onPress={() => void pick()}
        disabled={busy}
      />
      {uri ? (
        <Button title={t('photo.remove')} variant="ghost" onPress={() => onChange(null)} />
      ) : null}
    </View>
  );
}
