import { z } from 'zod';

// Error messages are i18n keys; the UI translates them with t().
export const decimal = z
  .string()
  .trim()
  .min(1, 'errors.required')
  .transform((s) => Number(s.replace(',', '.')))
  .pipe(z.number({ message: 'errors.notANumber' }).positive('errors.positive'));

export const weightFormSchema = z.object({
  weight: decimal,
  // refine runs at validation time; z.date().max(new Date()) would freeze "now" when the module loads
  measuredAt: z.date().refine((d) => d.getTime() <= Date.now() + 60_000, 'errors.futureDate'),
  note: z.string().max(280, 'errors.tooLong').optional(),
  // see PhotoValue in ./photo: a saved photo, a just-picked one, or none
  photo: z
    .union([z.object({ stored: z.string() }), z.object({ picked: z.string() })])
    .nullable()
    .optional(),
});
export type WeightFormInput = z.input<typeof weightFormSchema>;
export type WeightFormOutput = z.output<typeof weightFormSchema>;
