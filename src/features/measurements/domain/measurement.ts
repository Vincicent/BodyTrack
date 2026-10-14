import { MEASUREMENT_SITES, type MeasurementSite } from '@/shared/lib/measurementSites';
import { z } from 'zod';

export type { MeasurementSite };

export const measurementEntrySchema = z.object({
  id: z.number().int(),
  measuredAt: z.date(),
  site: z.enum(MEASUREMENT_SITES),
  valueCm: z.number().min(5).max(300),
  note: z.string().max(280).nullable(),
});
export type MeasurementEntry = z.infer<typeof measurementEntrySchema>;
export type NewMeasurementEntry = Omit<MeasurementEntry, 'id'>;

export function latestBySite(
  entries: MeasurementEntry[],
): Partial<Record<MeasurementSite, MeasurementEntry>> {
  const out: Partial<Record<MeasurementSite, MeasurementEntry>> = {};
  for (const e of entries) {
    const current = out[e.site];
    if (!current || e.measuredAt.getTime() > current.measuredAt.getTime()) out[e.site] = e;
  }
  return out;
}
