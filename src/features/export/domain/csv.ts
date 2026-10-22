import { z } from 'zod';
import type {
  MeasurementEntry,
  NewMeasurementEntry,
} from '@/features/measurements/domain/measurement';
import type { NewWeightEntry, WeightEntry } from '@/features/weight';
import { MEASUREMENT_SITES } from '@/shared/lib/measurementSites';

/**
 * One file for the whole backup: weights AND measurements. `value` is always in the stored unit (kg for a weight,
 * cm for a measurement), whatever the display setting; `site` is empty for a weight.
 */
export const BACKUP_HEADER = 'type,date,site,value,note';
/** Exports made before measurements were included: still importable. */
export const LEGACY_WEIGHTS_HEADER = 'date,weight_kg,note';

const escape = (v: string) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const noteCell = (note: string | null) => escape((note ?? '').replace(/\r?\n/g, ' '));

/** Weights and measurements in one CSV, newest first. */
export function backupToCsv(weights: WeightEntry[], measurements: MeasurementEntry[]): string {
  const rows = [
    ...weights.map((e) => ({
      at: e.measuredAt,
      cells: ['weight', '', e.weightKg, e.note] as const,
    })),
    ...measurements.map((e) => ({
      at: e.measuredAt,
      cells: ['measurement', e.site, e.valueCm, e.note] as const,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  const lines = rows.map(({ at, cells: [type, site, value, note] }) =>
    [type, at.toISOString(), site, value.toString(), noteCell(note)].join(','),
  );
  return [BACKUP_HEADER, ...lines].join('\n');
}

export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const date = z.coerce.date().refine((d) => !Number.isNaN(d.getTime()));
const note = z.string().transform((s) => s || null);
const weightRow = z.object({
  measuredAt: date,
  weightKg: z.coerce.number().min(20).max(400),
  note,
});
// "calf" (no side) is how backups made before left/right calves name it: imported as both, like the database migration
const LEGACY_CALF = 'calf';
const measurementRow = z.object({
  measuredAt: date,
  site: z.enum([...MEASUREMENT_SITES, LEGACY_CALF]),
  valueCm: z.coerce.number().min(5).max(300),
  note,
});

export type ParsedBackup = {
  weights: NewWeightEntry[];
  measurements: NewMeasurementEntry[];
  /** Rows that were invalid (bad date, unknown type or site, value out of range…). */
  skipped: number;
};

/**
 * CSV text → valid weights + valid measurements + number of skipped rows; null when the file isn't a BodyTrack
 * export (unknown header). Accepts the old weights-only format too. Pure: easy to test.
 */
export function parseBackupCsv(text: string): ParsedBackup | null {
  // Excel adds an invisible "byte order mark" (﻿) at the start of the file: drop it.
  const [header = '', ...rows] = text.replace(/^﻿/, '').trim().split(/\r?\n/);
  const legacy = header.trim() === LEGACY_WEIGHTS_HEADER;
  if (!legacy && header.trim() !== BACKUP_HEADER) return null;

  const result: ParsedBackup = { weights: [], measurements: [], skipped: 0 };
  for (const row of rows) {
    const cells = parseCsvLine(row);
    const [type, measuredAt, site, value, note = ''] = legacy
      ? ['weight', cells[0], '', cells[1], cells[2]]
      : cells;
    if (type === 'weight') {
      const parsed = weightRow.safeParse({ measuredAt, weightKg: value, note });
      if (parsed.success) {
        result.weights.push(parsed.data);
        continue;
      }
    } else if (type === 'measurement') {
      const parsed = measurementRow.safeParse({ measuredAt, site, valueCm: value, note });
      if (parsed.success) {
        const { site: parsedSite, ...entry } = parsed.data;
        if (parsedSite === LEGACY_CALF) {
          result.measurements.push({ ...entry, site: 'calfL' }, { ...entry, site: 'calfR' });
        } else {
          result.measurements.push({ ...entry, site: parsedSite });
        }
        continue;
      }
    }
    result.skipped++;
  }
  return result;
}
