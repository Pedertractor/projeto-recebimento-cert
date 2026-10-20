import { z } from 'zod';

import { inspectionDimensionFieldsSchemaForProductType } from '@/schemas/inspection-dimensions.schema';

const certificateComparisonFormBaseSchema = z.object({
  receiptDate: z.string().min(1, 'Informe a data do recebimento.'),
  materialDescription: z
    .string()
    .trim()
    .min(1, 'Informe a descrição do material.'),
  rm: z.string().trim().min(1, 'Informe o RM.'),
  certificateNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número do certificado.'),
  chemicalComposition: z.enum(['OK', 'NOK'], {
    message: 'Informe se a composição química está OK ou NOK.',
  }),
  quantitySpecified: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade especificada na NF.'),
  quantityFound: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade encontrada no recebimento.'),
  visualInspection: z.enum(['OK', 'NOK'], {
    message: 'Informe se o visual está OK ou NOK.',
  }),
  reportStatus: z.enum(['OK', 'NOK'], {
    message: 'Informe se o laudo foi aprovado ou reprovado.',
  }),
  receiverResponsible: z
    .string()
    .trim()
    .min(1, 'Informe o recebedor responsável.'),
  receiverEmployeeId: z.number().int().positive().nullable().optional(),
});

export function buildCertificateComparisonFormSchema(
  productTypeCode: string | undefined,
) {
  return certificateComparisonFormBaseSchema.extend(
    inspectionDimensionFieldsSchemaForProductType(productTypeCode).shape,
  );
}

export const certificateComparisonFormSchema =
  buildCertificateComparisonFormSchema('CHAPA');

export type CertificateComparisonFormValues = z.infer<
  typeof certificateComparisonFormSchema
>;
