import { selectBmi } from './selectors';
import {
  resetSettings,
  selectCrashReports,
  setCrashReports,
  setWeightUnit,
  settingsSlice,
  updateReminder,
} from './settingsSlice';

const reducer = settingsSlice.reducer;
const initial = settingsSlice.getInitialState();

describe('settingsSlice', () => {
  it('switches the weight unit', () =>
    expect(reducer(initial, setWeightUnit('lb')).weightUnit).toBe('lb'));

  it('partially updates the reminder', () =>
    expect(reducer(initial, updateReminder({ hour: 7 })).reminder).toEqual({
      enabled: false,
      hour: 7,
      minute: 0,
    }));

  it('resets everything', () => {
    const changed = reducer(
      reducer(initial, setWeightUnit('lb')),
      updateReminder({ enabled: true }),
    );
    expect(reducer(changed, resetSettings())).toEqual(initial);
  });
});

describe('crash reports (opt-out)', () => {
  const read = (settings: typeof initial) => selectCrashReports({ settings });
  it('are on by default', () => expect(read(initial)).toBe(true));
  it('can be turned off', () => expect(read(reducer(initial, setCrashReports(false)))).toBe(false));
  it('are on for settings saved before the option existed', () => {
    const { crashReports: _, ...older } = initial;
    expect(read(older)).toBe(true);
  });
});

describe('selectBmi', () => {
  it('needs a height', () => expect(selectBmi({ settings: initial }, 80)).toBeNull());
  it('computes the BMI', () =>
    expect(selectBmi({ settings: { ...initial, heightCm: 180 } }, 80)).toBeCloseTo(24.69, 2));
});
