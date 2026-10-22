import type { LengthUnit, WeightUnit } from '@/shared/lib/units';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePref = 'system' | 'light' | 'dark';
export type Language = 'system' | 'en' | 'fr';
type Reminder = { enabled: boolean; hour: number; minute: number };

export type SettingsState = {
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  heightCm: number | null;
  goalKg: number | null;
  theme: ThemePref;
  language: Language;
  reminder: Reminder;
  /** Anonymous crash reports: on by default (opt-out). Missing in settings persisted before it existed → on. */
  crashReports?: boolean;
};

const initialState: SettingsState = {
  weightUnit: 'kg',
  lengthUnit: 'cm',
  heightCm: null,
  goalKg: null,
  theme: 'system',
  language: 'system',
  reminder: { enabled: false, hour: 8, minute: 0 },
  crashReports: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setWeightUnit(state, action: PayloadAction<WeightUnit>) {
      state.weightUnit = action.payload; // Immer: looks like mutation, is immutable
    },
    setLengthUnit(state, action: PayloadAction<LengthUnit>) {
      state.lengthUnit = action.payload;
    },
    setHeightCm(state, action: PayloadAction<number | null>) {
      state.heightCm = action.payload;
    },
    setGoalKg(state, action: PayloadAction<number | null>) {
      state.goalKg = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePref>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    updateReminder(state, action: PayloadAction<Partial<Reminder>>) {
      Object.assign(state.reminder, action.payload);
    },
    setCrashReports(state, action: PayloadAction<boolean>) {
      state.crashReports = action.payload;
    },
    resetSettings: () => initialState,
  },
  selectors: {
    selectWeightUnit: (s) => s.weightUnit,
    selectLengthUnit: (s) => s.lengthUnit,
    selectHeightCm: (s) => s.heightCm,
    selectGoalKg: (s) => s.goalKg,
    selectTheme: (s) => s.theme,
    selectLanguage: (s) => s.language,
    selectReminder: (s) => s.reminder,
    selectCrashReports: (s) => s.crashReports !== false,
  },
});

export const {
  setWeightUnit,
  setLengthUnit,
  setHeightCm,
  setGoalKg,
  setTheme,
  setLanguage,
  updateReminder,
  setCrashReports,
  resetSettings,
} = settingsSlice.actions;
export const {
  selectWeightUnit,
  selectLengthUnit,
  selectHeightCm,
  selectGoalKg,
  selectTheme,
  selectLanguage,
  selectReminder,
  selectCrashReports,
} = settingsSlice.selectors;
