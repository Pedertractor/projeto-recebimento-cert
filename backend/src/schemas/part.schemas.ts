import z from 'zod';
import { ViewKind } from '../generated/prisma/enums.js';

export const externalPartImageSchema = z.object({
  id: z.number(),
  partId: z.number(),
  path: z.string(),
  name: z.string().nullable(),
  ripSelected: z.boolean(),
  isDeletable: z.boolean(),
});

export const externalPartResponseSchema = z.object({
  id: z.number(),
  partCode: z.string(),
  partNumber: z.string(),
  description: z.string().nullable(),
  group: z.string(),
  client: z.string().nullable(),
  serverPath: z.string().nullable(),
  localPath: z.string().nullable(),
  review: z.string().nullable(),
  reviewChanged: z.boolean(),
  status: z.boolean(),
  images: z.array(externalPartImageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExternalPartResponseDto = z.infer<
  typeof externalPartResponseSchema
>;

export const getExternalPartParamsSchema = z.object({
  partCode: z.string().trim().min(1, 'Informe o código da peça.'),
});

export type GetExternalPartParams = z.infer<typeof getExternalPartParamsSchema>;

export const getExternalPartByNumberParamsSchema = z.object({
  partNumber: z.string().trim().min(1, 'Informe o número da peça.'),
});

export type GetExternalPartByNumberParams = z.infer<
  typeof getExternalPartByNumberParamsSchema
>;

export const getRegisteredPartByCodeParamsSchema = z.object({
  partCode: z.string().trim().min(1, 'Informe o código da peça.'),
});

export type GetRegisteredPartByCodeParams = z.infer<
  typeof getRegisteredPartByCodeParamsSchema
>;

export const partViewSchema = z.object({
  id: z.number(),
  partId: z.number(),
  kind: z.enum(ViewKind),
  version: z.number().int().positive(),
  imagePath: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const partSchema = z.object({
  id: z.number(),
  basePartId: z.number().nullable(),
  partCode: z.string(),
  partNumber: z.string(),
  description: z.string().nullable(),
  client: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  views: z.array(partViewSchema),
});

export type PartResponse = z.infer<typeof partSchema>;

export const partListItemSchema = z.object({
  id: z.number(),
  basePartId: z.number().nullable(),
  partCode: z.string(),
  partNumber: z.string(),
  description: z.string().nullable(),
  client: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  viewsCount: z.number(),
});

export type PartListItem = z.infer<typeof partListItemSchema>;

export const listPartsResponseSchema = z.array(partListItemSchema);

export const getPartByIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID deve ser um número inteiro positivo')
    .transform(Number),
});

export type GetPartByIdParams = z.infer<typeof getPartByIdParamsSchema>;

export const updatePartViewImageParamsSchema = z.object({
  partId: z.coerce.number().int().positive(),
  kind: z.enum(ViewKind),
});

export type UpdatePartViewImageParams = z.infer<
  typeof updatePartViewImageParamsSchema
>;

export const VIEW_KINDS = [
  ViewKind.FRONT,
  ViewKind.TOP,
  ViewKind.BOTTOM,
  ViewKind.RIGHT,
  ViewKind.LEFT,
  ViewKind.REAR,
] as const;

export type ViewKindValue = (typeof VIEW_KINDS)[number];

export const createPartFieldsSchema = z.object({
  basePartId: z.coerce.number().int().positive(),
  partCode: z.string().trim().min(1),
  partNumber: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  client: z.string().nullable().optional(),
});

export type CreatePartFields = z.infer<typeof createPartFieldsSchema>;

export const createPartBodySchema = createPartFieldsSchema.extend({
  views: z
    .array(
      z.object({
        kind: z.enum(ViewKind),
        imagePath: z.string().min(1),
      }),
    )
    .length(VIEW_KINDS.length, 'Informe todas as vistas da peça.'),
});

export type CreatePartBody = z.infer<typeof createPartBodySchema>;
