import * as photoFiles from './photos';
import { weightRepository } from './weightRepository';

type Deps = {
  repo: Pick<typeof weightRepository, 'getById' | 'remove'>;
  photos: Pick<typeof photoFiles, 'deletePhoto'>;
};

/** Deletes an entry and its photo file (from the edit screen or a swipe in the list). */
export function deleteWeightEntry(
  id: number,
  { repo, photos }: Deps = { repo: weightRepository, photos: photoFiles },
): void {
  const entry = repo.getById(id);
  repo.remove(id);
  photos.deletePhoto(entry?.photoUri ?? null);
}
