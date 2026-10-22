import { MEASUREMENT_SITES, type MeasurementSite } from '@/shared/lib/measurementSites';
import { toCm, type LengthUnit } from '@/shared/lib/units';
import { z } from 'zod';
import type { NewMeasurementEntry } from './measurement';

const optionalDecimal = z
  .string()
  .trim()
  .transform((s) => (s === '' ? undefined : Number(s.replace(',', '.'))))
  .pipe(z.number({ message: 'errors.notANumber' }).positive('errors.positive').optional());

const valuesShape = Object.fromEntries(
  MEASUREMENT_SITES.map((s) => [s, optionalDecimal]),
) as Record<MeasurementSite, typeof optionalDecimal>;

export const measurementFormSchema = z
  .object({ measuredAt: z.date(), values: z.object(valuesShape) })
  .refine((v) => Object.values(v.values).some((x) => x !== undefined), {
    message: 'errors.atLeastOne',
    path: ['values'],
  });
export type MeasurementFormInput = z.input<typeof measurementFormSchema>;
export type MeasurementFormOutput = z.output<typeof measurementFormSchema>;

export const emptyMeasurementValues = () =>
  Object.fromEntries(MEASUREMENT_SITES.map((s) => [s, ''])) as Record<MeasurementSite, string>;

/** Form output → rows to insert (only the filled sites), converted to cm. */
export function toRows(values: MeasurementFormOutput, unit: LengthUnit): NewMeasurementEntry[] {
  return (Object.entries(values.values) as [MeasurementSite, number | undefined][])
    .filter((pair): pair is [MeasurementSite, number] => pair[1] !== undefined)
    .map(([site, value]) => ({
      measuredAt: values.measuredAt,
      site,
      valueCm: toCm(unit, value),
      note: null,
    }));
}

/** Editing ONE measurement: its site is fixed, the value is required (an edit can't empty it: delete it instead). */
export const measurementEntryFormSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, 'errors.required')
    .transform((s) => Number(s.replace(',', '.')))
    .pipe(z.number({ message: 'errors.notANumber' }).positive('errors.positive')),
  // refine runs at validation time; z.date().max(new Date()) would freeze "now" when the module loads
  measuredAt: z.date().refine((d) => d.getTime() <= Date.now() + 60_000, 'errors.futureDate'),
});
export type MeasurementEntryFormInput = z.input<typeof measurementEntryFormSchema>;
export type MeasurementEntryFormOutput = z.output<typeof measurementEntryFormSchema>;
