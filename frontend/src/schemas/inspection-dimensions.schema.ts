import { z } from 'zod';

import { usesChapaDimensionalMask } from '@/lib/inspection-dimensions';

const dimensionalThicknessSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, label)
    .regex(/^\d+,\d{2}$/, 'Use o formato 0,00 (vírgula e duas casas decimais).');

const dimensionalWidthLengthSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, label)
    .regex(
      /^\d+,\d{3}$/,
      'Use o formato 0,000 (vírgula e três casas decimais).',
    );

export const dimensionalSpecifiedFieldsSchema = z.object({
  dimensionalSpecifiedThickness: dimensionalThicknessSchema(
    'Informe a espessura especificada na NF.',
  ),
  dimensionalSpecifiedWidth: dimensionalWidthLengthSchema(
    'Informe a largura especificada na NF.',
  ),
  dimensionalSpecifiedLength: dimensionalWidthLengthSchema(
    'Informe o comprimento especificado na NF.',
  ),
});

export const dimensionalFoundFieldsSchema = z.object({
  dimensionalFoundThickness: dimensionalThicknessSchema(
    'Informe a espessura encontrada no recebimento.',
  ),
  dimensionalFoundWidth: dimensionalWidthLengthSchema(
    'Informe a largura encontrada no recebimento.',
  ),
  dimensionalFoundLength: dimensionalWidthLengthSchema(
    'Informe o comprimento encontrado no recebimento.',
  ),
});

export const inspectionDimensionFieldsSchema =
  dimensionalSpecifiedFieldsSchema.merge(dimensionalFoundFieldsSchema);

const freeTextDimensionalPartSchema = z.string().trim();

export const freeTextDimensionalSpecifiedFieldsSchema = z.object({
  dimensionalSpecifiedThickness: z
    .string()
    .trim()
    .min(1, 'Informe o dimensional especificado na NF.'),
  dimensionalSpecifiedWidth: freeTextDimensionalPartSchema,
  dimensionalSpecifiedLength: freeTextDimensionalPartSchema,
});

export const freeTextDimensionalFoundFieldsSchema = z.object({
  dimensionalFoundThickness: z
    .string()
    .trim()
    .min(1, 'Informe o dimensional encontrado no recebimento.'),
  dimensionalFoundWidth: freeTextDimensionalPartSchema,
  dimensionalFoundLength: freeTextDimensionalPartSchema,
});

export const freeTextInspectionDimensionFieldsSchema =
  freeTextDimensionalSpecifiedFieldsSchema.merge(
    freeTextDimensionalFoundFieldsSchema,
  );

export function inspectionDimensionFieldsSchemaForProductType(
  productTypeCode: string | undefined,
) {
  return usesChapaDimensionalMask(productTypeCode)
    ? inspectionDimensionFieldsSchema
    : freeTextInspectionDimensionFieldsSchema;
}
