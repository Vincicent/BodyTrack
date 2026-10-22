import { FoodLookup } from '@/features/food/components/FoodLookup';
import { Screen } from '@/shared/ui';

// A tab, not a modal from the dashboard: its own destination, one tap away when scanning in a shop
export default function FoodScreen() {
  return (
    <Screen>
      <FoodLookup />
    </Screen>
  );
}
