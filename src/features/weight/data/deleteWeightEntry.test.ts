import { deleteWeightEntry } from './deleteWeightEntry';

jest.mock('./weightRepository', () => ({ weightRepository: {} }));
jest.mock('./photos', () => ({}));

describe('deleteWeightEntry', () => {
  const setup = (photoUri: string | null) => ({
    repo: { getById: jest.fn(() => ({ id: 4, photoUri }) as never), remove: jest.fn() },
    photos: { deletePhoto: jest.fn() },
  });

  it('deletes the entry and its photo file', () => {
    const deps = setup('photos/a.jpg');
    deleteWeightEntry(4, deps);
    expect(deps.repo.remove).toHaveBeenCalledWith(4);
    expect(deps.photos.deletePhoto).toHaveBeenCalledWith('photos/a.jpg');
  });

  it('deletes an entry without a photo', () => {
    const deps = setup(null);
    deleteWeightEntry(4, deps);
    expect(deps.repo.remove).toHaveBeenCalledWith(4);
    expect(deps.photos.deletePhoto).toHaveBeenCalledWith(null);
  });
});
