import { bmi } from '@/features/weight';
import { createSelector } from '@reduxjs/toolkit';
import type { SettingsState } from './settingsSlice';

type WithSettings = { settings: SettingsState };

/** BMI from the stored height and the given weight; null if either is missing. */
export const selectBmi = createSelector(
  [
    (s: WithSettings) => s.settings.heightCm,
    (_: WithSettings, latestKg: number | null) => latestKg,
  ],
  (heightCm, latestKg) => (heightCm && latestKg ? bmi(latestKg, heightCm) : null),
);
