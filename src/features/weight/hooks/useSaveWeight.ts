import { toKg, type WeightUnit } from '@/shared/lib/units';
import * as photoFiles from '../data/photos';
import { weightRepository } from '../data/weightRepository';
import { planPhotoChange } from '../domain/photo';
import type { WeightFormOutput } from '../domain/weightForm';

type Repo = Pick<typeof weightRepository, 'add' | 'update'>;
type Photos = Pick<typeof photoFiles, 'storePhoto' | 'deletePhoto'>;
type Existing = { id: number; photoUri: string | null };

/**
 * Returns save(values, existing?): converts the user's unit to kg, then adds (or updates `existing`).
 * Photo files follow the entry: a picked photo is moved into the app's photos, a replaced or removed one is deleted
 * AFTER the database write, so a failed save never leaves an entry pointing at a deleted file.
 */
export function useSaveWeight(
  unit: WeightUnit,
  repo: Repo = weightRepository,
  photos: Photos = photoFiles,
) {
  return async (values: WeightFormOutput, existing?: Existing) => {
    const photo = values.photo ?? null;
    const plan = planPhotoChange(existing?.photoUri ?? null, photo);
    const photoUri = plan.store
      ? await photos.storePhoto(plan.store)
      : photo && 'stored' in photo
        ? photo.stored
        : null;
    const entry = {
      measuredAt: values.measuredAt,
      weightKg: toKg(unit, values.weight),
      note: values.note?.trim() || null,
      ...(plan.column === 'set' ? { photoUri } : {}),
    };
    if (existing === undefined) repo.add(entry);
    else repo.update(existing.id, entry);
    photos.deletePhoto(plan.remove);
  };
}
