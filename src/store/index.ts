import { settingsSlice } from '@/features/settings';
import { configureStore } from '@reduxjs/toolkit';
import Storage from 'expo-sqlite/kv-store';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { rootReducer } from './rootReducer';

const persistedReducer = persistReducer(
  { key: 'root', version: 1, storage: Storage, whitelist: [settingsSlice.reducerPath] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      // redux-persist dispatches non-serialisable actions; tell RTK they're fine
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
