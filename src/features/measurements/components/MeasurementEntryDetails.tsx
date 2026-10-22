import { confirm } from '@/shared/lib/confirm';
import { goBackOrHome } from '@/shared/lib/navigation';
import type { LengthUnit } from '@/shared/lib/units';
import {
  AppText,
  Button,
  Card,
  ErrorScreen,
  HeaderButton,
  LoadingState,
  Screen,
} from '@/shared/ui';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { measurementRepository } from '../data/measurementRepository';
import { formatLength, formatLengthChange } from '../domain/siteSummary';
import { useMeasurements } from '../hooks/useMeasurements';

/**
 * One measurement, read-only: the site, value, date, change from the previous one of the same site, and note.
 * Same pattern as a weight entry: "Edit" in the header, "Delete" here. Live after an edit.
 */
export function MeasurementEntryDetails({ id, unit }: { id: number; unit: LengthUnit }) {
  const { t, i18n } = useTranslation();
  const { entries, isLoading, error, refresh } = useMeasurements(); // every site, newest first
  if (error) return <ErrorScreen error={error} retry={refresh} />;
  if (isLoading) return <LoadingState />;
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <Screen>
        <AppText>{t('notFound.message')}</AppText>
      </Screen>
    );
  }

  const sameSite = entries.filter((e) => e.site === entry.site);
  const previous = sameSite[sameSite.indexOf(entry) + 1];
  const locale = i18n.language;
  const when = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(
    entry.measuredAt,
  );
  const change = previous
    ? formatLengthChange(entry.valueCm - previous.valueCm, unit, locale)
    : null;

  const onDelete = async () => {
    const ok = await confirm({
      title: t('form.deleteConfirmTitle'),
      message: t('form.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    measurementRepository.remove(entry.id);
    goBackOrHome();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t(`sites.${entry.site}`),
          headerRight: () => (
            <HeaderButton
              title={t('common.edit')}
              onPress={() =>
                router.push({
                  pathname: '/measurement/edit/[id]',
                  params: { id: String(entry.id) },
                })
              }
            />
          ),
        }}
      />
      <Screen>
        <AppText variant="number">{formatLength(entry.valueCm, unit, locale)}</AppText>
        <AppText variant="caption">{when}</AppText>
        <AppText>
          {change ? t('details.sincePrevious', { value: change }) : t('details.first')}
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
