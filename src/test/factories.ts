import type { MeasurementEntry } from '@/features/measurements/domain/measurement';
import type { WeightEntry } from '@/features/weight/domain/weight';

let nextId = 1;

export function makeWeight(overrides: Partial<WeightEntry> = {}): WeightEntry {
  return {
    id: nextId++,
    measuredAt: new Date('2026-10-01T08:00:00Z'),
    weightKg: 75,
    note: null,
    ...overrides,
  };
}

export function makeMeasurement(overrides: Partial<MeasurementEntry> = {}): MeasurementEntry {
  return {
    id: nextId++,
    measuredAt: new Date('2026-10-01T08:00:00Z'),
    site: 'waist',
    valueCm: 85,
    note: null,
    ...overrides,
  };
}
