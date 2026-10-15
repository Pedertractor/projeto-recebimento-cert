import { z } from 'zod';

export const createProductTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do tipo.')
    .max(80, 'Nome muito longo.'),
  code: z
    .string()
    .trim()
    .min(1, 'Informe o código.')
    .max(32, 'Código muito longo.')
    .transform((value) => value.toUpperCase())
    .refine(
      (value) => /^[A-Z0-9_]+$/.test(value),
      'Use apenas letras, números e sublinhado (ex.: CHAPA, TUBO_01).',
    ),
});

export type CreateProductTypeFormValues = z.infer<
  typeof createProductTypeFormSchema
>;
