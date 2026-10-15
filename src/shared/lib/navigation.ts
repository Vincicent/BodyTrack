import { router } from 'expo-router';

/** Close the current screen. Opened from a deep link or a URL there is no history, so go home instead. */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
