import { selectWeightUnit } from '@/features/settings';
import { formatWeightNumber } from '@/shared/lib/units';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';

/** (kg) => "176.4 lb" / "72,5 kg" / "3,25 kg": the user's unit and locale. */
export function useFormatWeight() {
  const unit = useAppSelector(selectWeightUnit);
  const { i18n } = useTranslation();
  return (kg: number) => `${formatWeightNumber(kg, unit, i18n.language)} ${unit}`;
}
