import { useLiveQuery } from '@/shared/db/useLiveQuery';
import { measurementEntries } from '@/shared/db/schema';
import type { MeasurementSite } from '@/shared/lib/measurementSites';
import { measurementRepository } from '../data/measurementRepository';
import type { MeasurementEntry } from '../domain/measurement';

export function useMeasurements(site?: MeasurementSite): {
  entries: MeasurementEntry[];
  error: Error | undefined;
  isLoading: boolean;
  refresh: () => void;
} {
  const { data, error, updatedAt, refresh } = useLiveQuery(
    measurementRepository.listQuery(site),
    measurementEntries,
    [site],
  );
  return { entries: data ?? [], error, isLoading: updatedAt === undefined && !error, refresh };
}
