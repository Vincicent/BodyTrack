import { AboutSection } from '@/features/settings/components/AboutSection';
import { DataSection } from '@/features/settings/components/DataSection';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import { ReminderSection } from '@/features/settings/components/ReminderSection';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { Screen } from '@/shared/ui';

export default function SettingsScreen() {
  return (
    <Screen>
      <SettingsForm />
      <ReminderSection />
      <DataSection />
      <PrivacySection />
      <AboutSection />
    </Screen>
  );
}
