import { SiteSummaryList } from '@/features/measurements/components/SiteSummaryList';
import { selectLengthUnit } from '@/features/settings';
import { useAppSelector } from '@/store/hooks';

export default function MeasurementsScreen() {
  const unit = useAppSelector(selectLengthUnit);
  return <SiteSummaryList unit={unit} />;
}
