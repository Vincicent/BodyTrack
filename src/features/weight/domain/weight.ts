import { z } from 'zod';

export const weightEntrySchema = z.object({
  id: z.number().int(),
  measuredAt: z.date(),
  weightKg: z.number().min(20).max(400),
  note: z.string().max(280).nullable(),
  photoUri: z.string().nullable(),
});
export type WeightEntry = z.infer<typeof weightEntrySchema>;
export type NewWeightEntry = Omit<WeightEntry, 'id' | 'photoUri'> & { photoUri?: string | null };
