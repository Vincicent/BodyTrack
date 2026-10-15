import { router } from 'expo-router';
import { goBackOrHome } from './navigation';

jest.mock('expo-router', () => ({
  router: { canGoBack: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
const r = jest.mocked(router);

beforeEach(() => jest.clearAllMocks());

it('goes back when there is history', () => {
  r.canGoBack.mockReturnValue(true);
  goBackOrHome();
  expect(r.back).toHaveBeenCalled();
});

it('goes home after a deep link (no history)', () => {
  r.canGoBack.mockReturnValue(false);
  goBackOrHome();
  expect(r.replace).toHaveBeenCalledWith('/');
});
