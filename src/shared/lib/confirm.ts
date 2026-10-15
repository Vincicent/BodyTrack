import { Alert } from 'react-native';

type ConfirmOptions = { title: string; message: string; confirmLabel: string; cancelLabel: string };

/** Ask the user to confirm a destructive action. Resolves to true if confirmed. */
export function confirm({
  title,
  message,
  confirmLabel,
  cancelLabel,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
