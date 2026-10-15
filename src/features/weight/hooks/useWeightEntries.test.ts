import { useLiveQuery } from '@/shared/db/useLiveQuery';
import { makeWeight } from '@/test/factories';
import { renderHook } from '@/test/render';
import { useWeightEntries } from './useWeightEntries';

jest.mock('@/shared/db/useLiveQuery', () => ({ useLiveQuery: jest.fn() }));
jest.mock('../data/weightRepository', () => ({ weightRepository: { listQuery: jest.fn() } }));
const mockedUseLiveQuery = jest.mocked(useLiveQuery);
const refresh = jest.fn();

describe('useWeightEntries', () => {
  it('is loading until the first result arrives', async () => {
    mockedUseLiveQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      updatedAt: undefined,
      refresh,
    });
    const { result } = await renderHook(() => useWeightEntries());
    expect(result.current).toMatchObject({ isLoading: true, entries: [] });
  });

  it('returns the entries once loaded', async () => {
    const entries = [makeWeight()];
    mockedUseLiveQuery.mockReturnValue({
      data: entries,
      error: undefined,
      updatedAt: new Date(),
      refresh,
    } as never);
    const { result } = await renderHook(() => useWeightEntries());
    expect(result.current).toMatchObject({ isLoading: false, entries });
  });

  it('stops loading when the query fails', async () => {
    const error = new Error('no such table');
    mockedUseLiveQuery.mockReturnValue({ data: undefined, error, updatedAt: undefined, refresh });
    const { result } = await renderHook(() => useWeightEntries());
    expect(result.current).toMatchObject({ isLoading: false, error });
  });
});
