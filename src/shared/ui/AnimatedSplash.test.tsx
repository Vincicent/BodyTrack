import { act, fireEvent, renderWithProviders, screen } from '@/test/render';
import * as SplashScreen from 'expo-splash-screen';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatedSplash, LOAD_TIMEOUT, SPLASH_DURATION } from './AnimatedSplash';

jest.mock('react-native-reanimated', () => ({
  __esModule: true, // keep the default export (Animated)
  ...jest.requireActual('react-native-reanimated'),
  useReducedMotion: jest.fn(() => false),
}));
jest.mock('expo-splash-screen', () => ({
  hide: jest.fn(),
  preventAutoHideAsync: jest.fn(),
  setOptions: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(SplashScreen.hide).mockClear();
});
afterEach(() => jest.useRealTimers());

const hidden = { includeHiddenElements: true }; // it is decoration, hidden from screen readers

const advance = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

it.each([false, true])(
  'waits for both layers, swaps with the native splash, then removes itself (reduce motion: %s)',
  async (reduce) => {
    jest.mocked(useReducedMotion).mockReturnValue(reduce);
    await renderWithProviders(<AnimatedSplash />);
    expect(screen.getByTestId('animated-splash', hidden)).toBeOnTheScreen();
    expect(screen.queryByTestId('animated-splash')).toBeNull(); // the accessible query can't see it

    await fireEvent(screen.getByTestId('splash-target', hidden), 'load');
    expect(SplashScreen.hide).not.toHaveBeenCalled(); // the arrow isn't loaded yet
    await fireEvent(screen.getByTestId('splash-arrow', hidden), 'load');
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);

    await advance(SPLASH_DURATION);
    expect(screen.queryByTestId('animated-splash', hidden)).toBeNull();
  },
);

it('never blocks the app when an image fails to load', async () => {
  await renderWithProviders(<AnimatedSplash />);
  await advance(LOAD_TIMEOUT);
  expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  await advance(SPLASH_DURATION);
  expect(screen.queryByTestId('animated-splash', hidden)).toBeNull();
});
