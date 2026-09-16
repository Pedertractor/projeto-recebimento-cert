import z from 'zod';
import { ViewKind } from '../generated/prisma/enums.js';

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida.');

export const tightnessTestAreaSchema = z.object({
  viewKind: z.enum(ViewKind),
  color: hexColorSchema,
  coordinates: z
    .array(z.string().trim().min(1, 'Informe a coordenada.'))
    .min(1, 'Informe ao menos uma coordenada.'),
  weldDefectTypeIds: z
    .array(z.number().int().positive())
    .min(1, 'Selecione ao menos um tipo de defeito.'),
});

export type TightnessTestAreaInput = z.infer<typeof tightnessTestAreaSchema>;

export const createTightnessTestBodySchema = z.object({
  partId: z.number().int().positive(),
  ofNumber: z.string().trim().min(1, 'Informe o número da OF.'),
  serialNumber: z.number().int().nullable().optional(),
  gridColumns: z.number().int().min(1).max(26),
  gridRows: z.number().int().min(1).max(26),
  gridVersion: z.number().int().positive(),
  areas: z
    .array(tightnessTestAreaSchema)
    .min(1, 'Registre ao menos uma área de vazamento com problema apontado.'),
});

export type CreateTightnessTestBody = z.infer<
  typeof createTightnessTestBodySchema
>;

export const tightnessTestResponseSchema = z.object({
  id: z.number(),
  partId: z.number(),
  operatorId: z.number(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  gridColumns: z.number(),
  gridRows: z.number(),
  gridVersion: z.number(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  leaksCount: z.number(),
});

export type TightnessTestResponse = z.infer<typeof tightnessTestResponseSchema>;

export const getTightnessTestByIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type GetTightnessTestByIdParams = z.infer<
  typeof getTightnessTestByIdParamsSchema
>;

export const tightnessTestListItemSchema = z.object({
  id: z.number(),
  partId: z.number(),
  ofNumber: z.string().nullable(),
  serialNumber: z.number().nullable(),
  partCode: z.string(),
  partNumber: z.string(),
  client: z.string().nullable(),
  operatorName: z.string(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  leaksCount: z.number(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  firstFaceImagePath: z.string().nullable(),
  views: z.array(
    z.object({
      id: z.number(),
      kind: z.enum(ViewKind),
      version: z.number(),
      imagePath: z.string().nullable(),
    }),
  ),
});

export type TightnessTestListItem = z.infer<typeof tightnessTestListItemSchema>;

export const listTightnessTestsResponseSchema = z.array(
  tightnessTestListItemSchema,
);

export const tightnessTestDetailDefectTypeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
});

export const tightnessTestDetailAreaSchema = z.object({
  id: z.number(),
  partViewId: z.number(),
  viewKind: z.enum(ViewKind),
  viewVersion: z.number(),
  color: z.string(),
  coordinates: z.array(z.string()),
  defectTypes: z.array(tightnessTestDetailDefectTypeSchema),
  notes: z.string().nullable(),
});

export const tightnessTestDetailPartViewSchema = z.object({
  id: z.number(),
  kind: z.enum(ViewKind),
  version: z.number(),
  imagePath: z.string().nullable(),
});

export const tightnessTestDetailPartSchema = z.object({
  id: z.number(),
  partCode: z.string(),
  partNumber: z.string(),
  description: z.string().nullable(),
  client: z.string().nullable(),
  views: z.array(tightnessTestDetailPartViewSchema),
});

export const tightnessTestDetailOperatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  cardNumber: z.string(),
});

export const tightnessTestDetailSchema = z.object({
  id: z.number(),
  ofNumber: z.string().nullable(),
  serialNumber: z.number().nullable(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  gridColumns: z.number(),
  gridRows: z.number(),
  gridVersion: z.number(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  part: tightnessTestDetailPartSchema,
  operator: tightnessTestDetailOperatorSchema,
  areas: z.array(tightnessTestDetailAreaSchema),
});

export type TightnessTestDetail = z.infer<typeof tightnessTestDetailSchema>;
