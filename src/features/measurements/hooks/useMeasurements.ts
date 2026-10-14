import type { MeasurementSite } from '@/shared/lib/measurementSites';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { measurementRepository } from '../data/measurementRepository';

export function useMeasurements(site?: MeasurementSite) {
  const { data, error, updatedAt } = useLiveQuery(measurementRepository.listQuery(site), [site]);
  return { entries: data ?? [], error, isLoading: updatedAt === undefined };
}
