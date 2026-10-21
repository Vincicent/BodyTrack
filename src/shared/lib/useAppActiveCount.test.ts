import { act, renderHook } from '@/test/render';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppActiveCount } from './useAppActiveCount';

it('counts returns to the foreground', async () => {
  let listener: (s: AppStateStatus) => void = () => {};
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, l) => {
    listener = l as typeof listener;
    return { remove } as never;
  });
  const { result, unmount } = await renderHook(() => useAppActiveCount());
  expect(result.current).toBe(0);

  await act(async () => {
    listener('background');
    listener('active');
  });
  expect(result.current).toBe(1);

  await unmount();
  expect(remove).toHaveBeenCalled(); // no leaks
});
