import z from 'zod';

export const productTypeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
});

export type PublicProductType = z.infer<typeof productTypeSchema>;

export const listProductTypesResponseSchema = z.array(productTypeSchema);

export const createProductTypeBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do tipo.')
    .max(80, 'Nome muito longo.'),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'Informe o código.')
    .max(32, 'Código muito longo.')
    .regex(
      /^[A-Z0-9_]+$/,
      'Use apenas letras, números e sublinhado (ex.: CHAPA, TUBO_01).',
    ),
});

export type CreateProductTypeBody = z.infer<typeof createProductTypeBodySchema>;
