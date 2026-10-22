import { toKg, type WeightUnit } from '@/shared/lib/units';
import { weightRepository } from '../data/weightRepository';
import type { WeightFormOutput } from '../domain/weightForm';

type Repo = Pick<typeof weightRepository, 'add' | 'update'>;

/** Returns save(values, id?): converts the user's unit to kg, then adds or updates. reads `unit` from the store. */
export function useSaveWeight(unit: WeightUnit, repo: Repo = weightRepository) {
  return async (values: WeightFormOutput, id?: number) => {
    const entry = {
      measuredAt: values.measuredAt,
      weightKg: toKg(unit, values.weight),
      note: values.note?.trim() || null,
    };
    if (id === undefined) repo.add(entry);
    else repo.update(id, entry);
  };
}
