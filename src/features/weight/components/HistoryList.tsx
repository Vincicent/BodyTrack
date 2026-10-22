import { selectWeightUnit } from '@/features/settings';
import { EmptyState, ErrorScreen, LoadingState } from '@/shared/ui';
import { useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { deleteWeightEntry } from '../data/deleteWeightEntry';
import { toHistoryRows } from '../domain/history';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { MonthHeader } from './MonthHeader';
import { WeightRow } from './WeightRow';

// No <Screen> wrapper: a virtualised list must not be inside a ScrollView.
export function HistoryList() {
  const { t, i18n } = useTranslation();
  const { entries, isLoading, error, refresh } = useWeightEntries();
  const unit = useAppSelector(selectWeightUnit);
  if (error) return <ErrorScreen error={error} retry={refresh} />;
  if (isLoading) return <LoadingState />;
  if (entries.length === 0) {
    return (
      <EmptyState
        title={t('history.empty')}
        action={{ label: t('history.emptyAction'), href: '/entry/new' }}
      />
    );
  }
  const rows = toHistoryRows(entries, i18n.language);
  return (
    <FlashList
      data={rows}
      keyExtractor={(r) => r.key}
      getItemType={(r) => r.type}
      renderItem={({ item }) =>
        item.type === 'header' ? (
          <MonthHeader label={item.label} />
        ) : (
          <WeightRow row={item} unit={unit} onDelete={(id) => deleteWeightEntry(id)} />
        )
      }
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
