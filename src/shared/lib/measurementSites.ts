export const MEASUREMENT_SITES = [
  'neck',
  'chest',
  'waist',
  'hips',
  'armL',
  'armR',
  'thighL',
  'thighR',
  'calf',
] as const;
export type MeasurementSite = (typeof MEASUREMENT_SITES)[number];

/** For URL params: `/measurement/waist` is valid, `/measurement/foo` is not. */
export const isMeasurementSite = (value: string): value is MeasurementSite =>
  (MEASUREMENT_SITES as readonly string[]).includes(value);
