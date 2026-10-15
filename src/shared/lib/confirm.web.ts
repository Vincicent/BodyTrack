type ConfirmOptions = { title: string; message: string; confirmLabel: string; cancelLabel: string };

// React Native Web's Alert.alert() does nothing, so use the browser's dialog.
export function confirm({ title, message }: ConfirmOptions): Promise<boolean> {
  return Promise.resolve(window.confirm(`${title}\n\n${message}`));
}
