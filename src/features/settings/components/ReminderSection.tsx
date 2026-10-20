import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Card } from '@/shared/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Switch, View } from 'react-native';
import { cancelReminders, scheduleDailyReminder } from '../reminders';
import { selectReminder, updateReminder } from '../settingsSlice';

export function ReminderSection() {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const reminder = useAppSelector(selectReminder);
  const [denied, setDenied] = useState(false);

  if (Platform.OS === 'web') return null; // no local notifications in the browser: hide, don't show a broken switch

  const toggle = async (enabled: boolean) => {
    if (enabled) {
      const ok = await scheduleDailyReminder(reminder.hour, reminder.minute, t('reminders.body'));
      setDenied(!ok);
      if (!ok) return;
    } else {
      await cancelReminders();
    }
    dispatch(updateReminder({ enabled }));
  };

  const time = `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')}`;
  return (
    <Card title={t('reminders.title')}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText>{`${t('reminders.daily')} · ${time}`}</AppText>
        <Switch
          accessibilityLabel={t('reminders.daily')}
          value={reminder.enabled}
          onValueChange={toggle}
          trackColor={{ true: theme.colors.primary }}
        />
      </View>
      {denied ? (
        <>
          <AppText variant="caption">{t('reminders.denied')}</AppText>
          <Button
            title={t('reminders.openSettings')}
            variant="ghost"
            onPress={() => Linking.openSettings()}
          />
        </>
      ) : null}
    </Card>
  );
}
