import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { backupToCsv, parseBackupCsv } from '@/features/export/domain/csv';
import { pickCsvText } from '@/features/export/pickCsvText';
import { shareCsv } from '@/features/export/shareCsv';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { weightRepository } from '@/features/weight/data/weightRepository';
import { confirm } from '@/shared/lib/confirm';
import { AppText, Button, Card } from '@/shared/ui';
import { useAppDispatch } from '@/store/hooks';
import { resetSettings } from '../settingsSlice';

export function DataSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState<string | null>(null);

  // One file with everything: weights AND measurements (a backup that forgets half the data isn't one)
  const onExport = async () => {
    const csv = backupToCsv(
      weightRepository.listQuery().all(),
      measurementRepository.listQuery().all(),
    );
    await shareCsv(csv, `bodytrack-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const onImport = async () => {
    const text = await pickCsvText(); // a .web.ts version reads the file in the browser
    if (text === null) return;
    const backup = parseBackupCsv(text);
    if (!backup) {
      setMessage(t('export.notBodyTrack'));
      return;
    }
    weightRepository.addMany(backup.weights);
    measurementRepository.addMany(backup.measurements);
    setMessage(
      t('export.imported', {
        count: backup.weights.length + backup.measurements.length,
        skipped: backup.skipped,
      }),
    );
  };

  const onDeleteAll = async () => {
    const ok = await confirm({
      title: t('settings.deleteAll'),
      message: t('form.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    weightRepository.removeAll();
    measurementRepository.removeAll();
    dispatch(resetSettings());
  };

  return (
    <Card title={t('settings.data')}>
      <AppText variant="caption">{t('export.backupHint')}</AppText>
      <Button title={t('export.csv')} variant="ghost" onPress={onExport} />
      <Button title={t('export.import')} variant="ghost" onPress={onImport} />
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      <Button title={t('settings.deleteAll')} variant="ghost" onPress={onDeleteAll} />
    </Card>
  );
}
