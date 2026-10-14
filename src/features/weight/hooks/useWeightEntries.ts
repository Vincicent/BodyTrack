import { useLiveQuery } from '@/shared/db/useLiveQuery';
import { weightEntries } from '@/shared/db/schema';
import { weightRepository } from '../data/weightRepository';
import type { WeightEntry } from '../domain/weight';

/** Live list of entries, newest first. Exposes the domain type, not the DB row type. */
export function useWeightEntries(): {
  entries: WeightEntry[];
  error: Error | undefined;
  isLoading: boolean;
  refresh: () => void;
} {
  const { data, error, updatedAt, refresh } = useLiveQuery(
    weightRepository.listQuery(),
    weightEntries,
  );
  return { entries: data ?? [], error, isLoading: updatedAt === undefined && !error, refresh };
}
