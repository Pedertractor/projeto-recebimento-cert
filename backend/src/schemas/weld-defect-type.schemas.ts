import z from 'zod';

export const weldDefectTypeImageSchema = z.object({
  id: z.number(),
  path: z.string(),
  name: z.string().nullable(),
  createdAt: z.string(),
});

export type WeldDefectTypeImageResponse = z.infer<
  typeof weldDefectTypeImageSchema
>;

export const weldDefectTypeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(weldDefectTypeImageSchema),
});

export type WeldDefectTypeResponse = z.infer<typeof weldDefectTypeSchema>;

export const listWeldDefectTypesResponseSchema = z.array(weldDefectTypeSchema);

export const createWeldDefectTypeFieldsSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do tipo de defeito.'),
  name: z.string().trim().min(1, 'Informe o nome do tipo de defeito.'),
});

export type CreateWeldDefectTypeFields = z.infer<
  typeof createWeldDefectTypeFieldsSchema
>;

export const updateWeldDefectTypeParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type UpdateWeldDefectTypeParams = z.infer<
  typeof updateWeldDefectTypeParamsSchema
>;

export const updateWeldDefectTypeFieldsSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do tipo de defeito.'),
  name: z.string().trim().min(1, 'Informe o nome do tipo de defeito.'),
});

export type UpdateWeldDefectTypeFields = z.infer<
  typeof updateWeldDefectTypeFieldsSchema
>;
