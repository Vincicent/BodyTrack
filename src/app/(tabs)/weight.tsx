import { HistoryList } from '@/features/weight/components/HistoryList';

// The weight log: every entry, newest first (add, correct or delete). "Weight", not "History": measurements have
// their own history too.
export default function WeightScreen() {
  return <HistoryList />;
}
