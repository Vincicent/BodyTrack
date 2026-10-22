import * as SecureStore from 'expo-secure-store';

// Secrets (auth tokens) go in the Keychain / Keystore, never in Redux, AsyncStorage or the JS bundle.
const KEY = 'auth_token';
export const secureToken = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
