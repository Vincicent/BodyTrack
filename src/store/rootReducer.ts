import { foodApi } from '@/features/food/api/foodApi';
import { settingsSlice } from '@/features/settings';
import { combineReducers } from '@reduxjs/toolkit';

// Kept separate from index.ts (which creates the persisted store) so tests can import it without side effects.
export const rootReducer = combineReducers({
  [settingsSlice.reducerPath]: settingsSlice.reducer,
  [foodApi.reducerPath]: foodApi.reducer, // server cache: never persisted (not in the whitelist)
});
