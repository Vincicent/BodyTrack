import { getTableName } from 'drizzle-orm';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { act, renderHook } from '@/test/render';
import { measurementEntries, weightEntries } from './schema';
import { useLiveQuery } from './useLiveQuery';

jest.mock('expo-sqlite', () => ({ addDatabaseChangeListener: jest.fn() }));
const mockedAddListener = jest.mocked(addDatabaseChangeListener);

type ChangeListener = Parameters<typeof addDatabaseChangeListener>[0];
let emitChange: ChangeListener;
const remove = jest.fn();

/** A fake query: each `await` calls `read` again, like a Drizzle query does. */
const queryFrom = <T>(read: () => T): PromiseLike<T> => ({
  then: (onFulfilled, onRejected) => Promise.resolve().then(read).then(onFulfilled, onRejected),
});
const changeOf = (tableName: string) => ({ tableName }) as Parameters<ChangeListener>[0];
const busy = () => new Error('Sync operation timeout');

beforeEach(() => {
  jest.useFakeTimers();
  mockedAddListener.mockImplementation((listener) => {
    emitChange = listener;
    return { remove } as never;
  });
});
afterEach(() => jest.useRealTimers());

/** Flush timers and promise callbacks. */
const settle = () => act(async () => void (await jest.runAllTimersAsync()));

describe('useLiveQuery', () => {
  it('is loading, then returns the rows', async () => {
    const { result } = await renderHook(() =>
      useLiveQuery(
        queryFrom(() => [1, 2]),
        weightEntries,
      ),
    );
    await settle();
    expect(result.current.data).toEqual([1, 2]);
    expect(result.current.updatedAt).toBeInstanceOf(Date);
  });

  it('re-reads when its table changes, and only its table', async () => {
    let rows = [1];
    const { result } = await renderHook(() =>
      useLiveQuery(
        queryFrom(() => rows),
        weightEntries,
      ),
    );
    await settle();
    rows = [1, 2];
    await act(async () => emitChange(changeOf(getTableName(measurementEntries))));
    await settle();
    expect(result.current.data).toEqual([1]);
    await act(async () => emitChange(changeOf('weight_entries')));
    await settle();
    expect(result.current.data).toEqual([1, 2]);
  });

  it('merges a burst of changes into one read', async () => {
    const read = jest.fn(() => []);
    await renderHook(() => useLiveQuery(queryFrom(read), weightEntries));
    await settle();
    await act(async () => {
      for (let i = 0; i < 20; i++) emitChange(changeOf('weight_entries'));
    });
    await settle();
    expect(read).toHaveBeenCalledTimes(2); // the first load + one refresh
  });

  it('retries while the web worker is busy', async () => {
    let calls = 0;
    const read = () => {
      calls++;
      if (calls < 3) throw busy();
      return ['ok'];
    };
    const { result } = await renderHook(() => useLiveQuery(queryFrom(read), weightEntries));
    await settle();
    expect(result.current.data).toEqual(['ok']);
    expect(result.current.error).toBeUndefined();
  });

  it('returns other errors, and refresh() tries again', async () => {
    let fail = true;
    const read = () => {
      if (fail) throw new Error('no such table');
      return ['ok'];
    };
    const { result } = await renderHook(() => useLiveQuery(queryFrom(read), weightEntries));
    await settle();
    expect(result.current.error?.message).toBe('no such table');
    fail = false;
    await act(async () => result.current.refresh());
    await settle();
    expect(result.current).toMatchObject({ data: ['ok'], error: undefined });
  });

  it('stops listening on unmount', async () => {
    const { unmount } = await renderHook(() =>
      useLiveQuery(
        queryFrom(() => []),
        weightEntries,
      ),
    );
    await act(async () => unmount());
    expect(remove).toHaveBeenCalled();
  });
});
