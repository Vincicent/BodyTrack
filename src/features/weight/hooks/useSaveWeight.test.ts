import { renderHook } from '@/test/render';
import { useSaveWeight } from './useSaveWeight';

jest.mock('../data/weightRepository', () => ({ weightRepository: {} }));
jest.mock('../data/photos', () => ({}));

const setup = async (unit: 'kg' | 'lb' = 'kg') => {
  const repo = { add: jest.fn(), update: jest.fn() };
  const photos = {
    storePhoto: jest.fn(async (picked: string) => `photos/${picked.split('/').pop()}`),
    deletePhoto: jest.fn(),
  };
  const { result } = await renderHook(() => useSaveWeight(unit, repo, photos));
  return { save: result.current, repo, photos };
};
const base = { weight: 70, measuredAt: new Date('2026-10-01T08:00:00Z'), note: '' };

describe('useSaveWeight', () => {
  it('stores kilograms when the user types pounds', async () => {
    const { save, repo } = await setup('lb');
    await save({ ...base, weight: 160 });
    expect(repo.add).toHaveBeenCalledWith(expect.objectContaining({ note: null, photoUri: null }));
    expect(repo.add.mock.calls[0][0].weightKg).toBeCloseTo(72.57, 2);
  });

  it('updates the given entry', async () => {
    const { save, repo } = await setup();
    await save({ ...base, note: ' felt good ' }, { id: 7, photoUri: null });
    expect(repo.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ weightKg: 70, note: 'felt good' }),
    );
  });
});

describe('useSaveWeight: progress photo', () => {
  it('moves a picked photo into the app and saves its path with the new entry', async () => {
    const { save, repo, photos } = await setup();
    await save({ ...base, photo: { picked: 'file:///cache/ImageManipulator/a1.jpg' } });
    expect(photos.storePhoto).toHaveBeenCalledWith('file:///cache/ImageManipulator/a1.jpg');
    expect(repo.add).toHaveBeenCalledWith(expect.objectContaining({ photoUri: 'photos/a1.jpg' }));
  });

  it('leaves the photo alone when only the weight changes', async () => {
    const { save, repo, photos } = await setup();
    await save(
      { ...base, photo: { stored: 'photos/old.jpg' } },
      { id: 3, photoUri: 'photos/old.jpg' },
    );
    expect(repo.update.mock.calls[0][1]).not.toHaveProperty('photoUri');
    expect(photos.storePhoto).not.toHaveBeenCalled();
    expect(photos.deletePhoto).toHaveBeenCalledWith(null);
  });

  it('replaces the photo: the new one is saved, then the old file deleted', async () => {
    const { save, repo, photos } = await setup();
    await save(
      { ...base, photo: { picked: 'file:///cache/new.jpg' } },
      { id: 3, photoUri: 'photos/old.jpg' },
    );
    expect(repo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ photoUri: 'photos/new.jpg' }),
    );
    expect(photos.deletePhoto).toHaveBeenCalledWith('photos/old.jpg');
    // the database is written before the old file goes
    expect(repo.update.mock.invocationCallOrder[0]).toBeLessThan(
      photos.deletePhoto.mock.invocationCallOrder[0]!,
    );
  });

  it('removes the photo from the entry and deletes its file', async () => {
    const { save, repo, photos } = await setup();
    await save({ ...base, photo: null }, { id: 3, photoUri: 'photos/old.jpg' });
    expect(repo.update).toHaveBeenCalledWith(3, expect.objectContaining({ photoUri: null }));
    expect(photos.deletePhoto).toHaveBeenCalledWith('photos/old.jpg');
  });
});
