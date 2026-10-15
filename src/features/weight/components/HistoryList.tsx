import { EmptyState, LoadingState } from '@/shared/ui';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { weightRepository } from '../data/weightRepository';
import { toHistoryRows } from '../domain/history';
import { useWeightEntries } from '../hooks/useWeightEntries';
import { MonthHeader } from './MonthHeader';
import { WeightRow } from './WeightRow';

// No <Screen> wrapper: a virtualised list must not be inside a ScrollView.
export function HistoryList() {
  const { t, i18n } = useTranslation();
  const { entries, isLoading } = useWeightEntries();
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
          <WeightRow row={item} unit="kg" onDelete={(id) => weightRepository.remove(id)} />
        )
      }
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
