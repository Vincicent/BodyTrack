import { MEASUREMENT_SITES, type MeasurementSite } from '@/shared/lib/measurementSites';
import { cmTo, round, type LengthUnit } from '@/shared/lib/units';
import type { MeasurementEntry } from './measurement';

export type SiteSummary = {
  site: MeasurementSite;
  latest: MeasurementEntry;
  /** Latest minus first measurement, in cm; null when the site was measured only once. */
  changeCm: number | null;
};

/** One summary per measured site, in body order (neck → calf). Sites never measured are left out. */
export function summarizeSites(entries: MeasurementEntry[]): SiteSummary[] {
  const bySite = new Map<MeasurementSite, MeasurementEntry[]>();
  for (const e of entries) bySite.set(e.site, [...(bySite.get(e.site) ?? []), e]);
  return MEASUREMENT_SITES.flatMap((site) => {
    const list = bySite.get(site);
    if (!list) return [];
    const sorted = [...list].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
    const first = sorted[0]!;
    const latest = sorted.at(-1)!;
    return [{ site, latest, changeCm: sorted.length > 1 ? latest.valueCm - first.valueCm : null }];
  });
}

const MINUS = '−';
const oneDecimal = (locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "84.0 cm" / "33.1 in", in the user's unit and locale. */
export function formatLength(cm: number, unit: LengthUnit, locale: string): string {
  return `${oneDecimal(locale).format(round(cmTo(unit, cm), 1))} ${unit}`;
}

/** "−3.5 cm", "+1.0 cm", "±0.0 cm"; null when there's nothing to compare. */
export function formatLengthChange(
  cm: number | null,
  unit: LengthUnit,
  locale: string,
): string | null {
  if (cm === null) return null;
  const value = round(cmTo(unit, cm), 1);
  const abs = `${oneDecimal(locale).format(Math.abs(value))} ${unit}`;
  if (value === 0) return `±${abs}`;
  return `${value > 0 ? '+' : MINUS}${abs}`;
}
