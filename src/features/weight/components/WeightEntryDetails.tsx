import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import { formatWeightNumber, type WeightUnit } from '@/shared/lib/units';
import { useTheme } from '@/shared/theme/useTheme';
import {
  AppText,
  Button,
  Card,
  ErrorScreen,
  HeaderButton,
  LoadingState,
  Screen,
} from '@/shared/ui';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { deleteWeightEntry } from '../data/deleteWeightEntry';
import { photoUri } from '../data/photos';
import { formatDelta } from '../domain/history';
import { useWeightEntries } from '../hooks/useWeightEntries';

/**
 * One weight entry, read-only: its photo (large), weight, date, change from the previous entry and note.
 * "Edit" in the header opens the form; "Delete" is here. Live: it shows the new values after an edit.
 */
export function WeightEntryDetails({ id, unit }: { id: number; unit: WeightUnit }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { entries, isLoading, error, refresh } = useWeightEntries(); // newest first
  if (error) return <ErrorScreen error={error} retry={refresh} />;
  if (isLoading) return <LoadingState />;
  const index = entries.findIndex((e) => e.id === id);
  const entry = entries[index];
  if (!entry) {
    return (
      <Screen>
        <AppText>{t('notFound.message')}</AppText>
      </Screen>
    );
  }

  const previous = entries[index + 1];
  const locale = i18n.language;
  const weight = formatWeightNumber(entry.weightKg, unit, locale);
  const when = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(
    entry.measuredAt,
  );
  const delta = previous ? formatDelta(entry.weightKg - previous.weightKg, unit, locale) : null;

  const onDelete = async () => {
    const ok = await confirm({
      title: t('form.deleteConfirmTitle'),
      message: t('form.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    deleteWeightEntry(entry.id);
    goBackOrHome();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton
              title={t('common.edit')}
              onPress={() =>
                router.push({ pathname: '/entry/edit/[id]', params: { id: String(entry.id) } })
              }
            />
          ),
        }}
      />
      <Screen>
        {entry.photoUri ? (
          <Image
            source={{ uri: photoUri(entry.photoUri) }}
            accessibilityLabel={t('photo.label')}
            contentFit="contain"
            style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: theme.radius.md }}
          />
        ) : null}
        <AppText variant="number">
          {weight} {unit}
        </AppText>
        <AppText variant="caption">{when}</AppText>
        <AppText>
          {delta ? t('details.sincePrevious', { value: `${delta} ${unit}` }) : t('details.first')}
        </AppText>
        {entry.note ? (
          <Card title={t('details.note')}>
            <AppText>{entry.note}</AppText>
          </Card>
        ) : null}
        <Button title={t('form.deleteEntry')} variant="ghost" onPress={onDelete} />
      </Screen>
    </>
  );
}
