import z from 'zod';

export const qualityDocumentSchema = z.object({
  id: z.string(),
  productTypeId: z.number(),
  productTypeName: z.string(),
  year: z.number(),
  versionNumber: z.number(),
  displayName: z.string(),
  fileName: z.string(),
  storagePath: z.string(),
  uploadedByUserId: z.number(),
  uploadedByName: z.string().nullable(),
  createdAt: z.string(),
});

export type PublicQualityDocument = z.infer<typeof qualityDocumentSchema>;

export const listQualityDocumentsResponseSchema = z.array(qualityDocumentSchema);

export const qualityDocumentResponseSchema = qualityDocumentSchema;

export const createQualityDocumentFieldsSchema = z.object({
  productTypeId: z.coerce
    .number()
    .int('Selecione o tipo de produto.')
    .positive('Selecione o tipo de produto.'),
  year: z.coerce
    .number()
    .int('Informe o ano da versão.')
    .min(2000, 'Ano inválido.')
    .max(2100, 'Ano inválido.'),
});

export const currentQualityDocumentQuerySchema = z.object({
  productTypeId: z.coerce
    .number()
    .int()
    .positive('Informe o tipo de produto.'),
});

export type CreateQualityDocumentFields = z.infer<
  typeof createQualityDocumentFieldsSchema
>;
