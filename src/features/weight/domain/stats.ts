import type { WeightEntry } from './weight';

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Entries sorted by date ascending (returns a new array). */
export function sortByDate(entries: WeightEntry[]): WeightEntry[] {
  return entries.toSorted((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
}

/** Trailing moving average over the last `windowDays` days, for each entry (ascending order). */
export function movingAverage(
  entries: WeightEntry[],
  windowDays = 7,
): { date: Date; value: number }[] {
  const sorted = sortByDate(entries);
  const windowMs = windowDays * DAY_MS;
  return sorted.map((e, i) => {
    const from = e.measuredAt.getTime() - windowMs;
    const inWindow = sorted.slice(0, i + 1).filter((x) => x.measuredAt.getTime() > from);
    const value = inWindow.reduce((s, x) => s + x.weightKg, 0) / inWindow.length;
    return { date: e.measuredAt, value };
  });
}

/** Latest entry (at or before `now`) minus the latest entry at least `days` older than it. */
export function changeOver(entries: WeightEntry[], days: number, now = new Date()): number | null {
  const sorted = sortByDate(entries).filter((e) => e.measuredAt.getTime() <= now.getTime());
  const latest = sorted.at(-1);
  if (!latest) return null;
  const cutoff = latest.measuredAt.getTime() - days * DAY_MS;
  const reference = sorted.findLast((e) => e.measuredAt.getTime() <= cutoff);
  return reference ? latest.weightKg - reference.weightKg : null;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** 0 = at start, 1 = goal reached; clamped to [0, 1]. Works for losing and gaining. */
export function goalProgress(startKg: number, currentKg: number, goalKg: number): number {
  if (startKg === goalKg) return 1;
  const progress = (startKg - currentKg) / (startKg - goalKg);
  return Math.min(1, Math.max(0, progress));
}
