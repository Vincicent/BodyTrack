import { kgTo, round, WEIGHT_DECIMALS, type WeightUnit } from '@/shared/lib/units';
import type { WeightEntry } from './weight';

export type HistoryRow =
  | { type: 'header'; key: string; label: string }
  | { type: 'entry'; key: string; entry: WeightEntry; deltaKg: number | null };

/** Entries newest first → month headers (local time) + entries with the change vs the next older entry. */
export function toHistoryRows(entriesDesc: WeightEntry[], locale: string): HistoryRow[] {
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const rows: HistoryRow[] = [];
  let currentMonth = '';

  entriesDesc.forEach((entry, i) => {
    const d = entry.measuredAt;
    const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (monthKey !== currentMonth) {
      currentMonth = monthKey;
      rows.push({ type: 'header', key: `h-${monthKey}`, label: monthFormat.format(d) });
    }
    const older = entriesDesc[i + 1];
    rows.push({
      type: 'entry',
      key: `e-${entry.id}`,
      entry,
      deltaKg: older ? entry.weightKg - older.weightKg : null,
    });
  });
  return rows;
}

const MINUS = '−';

/** "+0.4", "−0.3", "±0.0" in the user's unit and locale; null when there's no delta. */
export function formatDelta(
  deltaKg: number | null,
  unit: WeightUnit,
  locale: string,
): string | null {
  if (deltaKg === null) return null;
  const decimals = WEIGHT_DECIMALS[unit]; // like the weights: a baby's +0.03 kg is not "±0.0"
  const value = round(kgTo(unit, deltaKg), decimals);
  const abs = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  if (value === 0) return `±${abs}`;
  return `${value > 0 ? '+' : MINUS}${abs}`;
}
