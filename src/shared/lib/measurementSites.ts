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
