import { rootReducer } from '@/store/rootReducer';
import { configureStore } from '@reduxjs/toolkit';

export type TestState = ReturnType<typeof rootReducer>;

/** A real store without persistence, optionally pre-filled. */
export function makeTestStore(preloadedState?: Partial<TestState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}
