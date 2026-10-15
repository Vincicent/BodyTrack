import { renderHook } from '@/test/render';
import { useSaveWeight } from './useSaveWeight';

jest.mock('../data/weightRepository', () => ({ weightRepository: {} }));

describe('useSaveWeight', () => {
  it('stores kilograms when the user types pounds', async () => {
    const repo = { add: jest.fn(), update: jest.fn() };
    const { result } = await renderHook(() => useSaveWeight('lb', repo));
    await result.current({ weight: 160, measuredAt: new Date('2026-10-01T08:00:00Z'), note: '' });
    expect(repo.add).toHaveBeenCalledWith(expect.objectContaining({ note: null }));
    expect(repo.add.mock.calls[0][0].weightKg).toBeCloseTo(72.57, 2);
  });

  it('updates when an id is given', async () => {
    const repo = { add: jest.fn(), update: jest.fn() };
    const { result } = await renderHook(() => useSaveWeight('kg', repo));
    await result.current({ weight: 70, measuredAt: new Date(), note: ' felt good ' }, 7);
    expect(repo.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ weightKg: 70, note: 'felt good' }),
    );
  });
});
