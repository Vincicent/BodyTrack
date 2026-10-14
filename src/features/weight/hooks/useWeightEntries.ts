import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { weightRepository } from '../data/weightRepository';
import type { WeightEntry } from '../domain/weight';

/** Live list of entries, newest first. Exposes the domain type, not the DB row type. */
export function useWeightEntries(): {
  entries: WeightEntry[];
  error: Error | undefined;
  isLoading: boolean;
} {
  const { data, error, updatedAt } = useLiveQuery(weightRepository.listQuery());
  return { entries: data ?? [], error, isLoading: updatedAt === undefined };
}
