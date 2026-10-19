import { selectBmi } from './selectors';
import { resetSettings, setWeightUnit, settingsSlice, updateReminder } from './settingsSlice';

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

describe('selectBmi', () => {
  it('needs a height', () => expect(selectBmi({ settings: initial }, 80)).toBeNull());
  it('computes the BMI', () =>
    expect(selectBmi({ settings: { ...initial, heightCm: 180 } }, 80)).toBeCloseTo(24.69, 2));
});
