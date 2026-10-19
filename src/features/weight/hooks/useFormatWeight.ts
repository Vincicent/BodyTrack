import { selectWeightUnit } from '@/features/settings';
import { kgTo } from '@/shared/lib/units';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';

/** (kg) => "176.4 lb" / "72,5 kg": the user's unit and locale. */
export function useFormatWeight() {
  const unit = useAppSelector(selectWeightUnit);
  const { i18n } = useTranslation();
  const format = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (kg: number) => `${format.format(kgTo(unit, kg))} ${unit}`;
}
