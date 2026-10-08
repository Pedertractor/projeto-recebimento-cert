import z from 'zod';
import { InspectionCheckResult } from '../generated/prisma/enums.js';

export const inspectionCheckResultSchema = z.enum(InspectionCheckResult);

export const certificateInspectionSchema = z.object({
  id: z.string(),
  attachmentId: z.string(),
  requestId: z.number(),
  qualityDocumentId: z.string(),
  qualityDocumentName: z.string(),
  receiptDate: z.string(),
  materialDescription: z.string(),
  rm: z.string(),
  certificateNumber: z.string(),
  chemicalComposition: inspectionCheckResultSchema,
  quantitySpecified: z.string(),
  quantityFound: z.string(),
  dimensionalSpecified: z.string(),
  dimensionalFound: z.string(),
  visualInspection: inspectionCheckResultSchema,
  reportStatus: inspectionCheckResultSchema,
  receiverResponsible: z.string(),
  receiverEmployeeId: z.number().nullable().optional(),
  inspectedByUserId: z.number(),
  inspectedAt: z.string(),
  isValid: z.boolean(),
});

export type PublicCertificateInspection = z.infer<
  typeof certificateInspectionSchema
>;

export const submitCertificateInspectionSchema = z.object({
  receiptDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data do recebimento.'),
  materialDescription: z
    .string()
    .trim()
    .min(1, 'Informe a descrição do material.'),
  rm: z.string().trim().min(1, 'Informe o RM.'),
  certificateNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número do certificado.'),
  chemicalComposition: inspectionCheckResultSchema,
  quantitySpecified: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade especificada na NF.'),
  quantityFound: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade encontrada no recebimento.'),
  dimensionalSpecified: z
    .string()
    .trim()
    .min(1, 'Informe o dimensional especificado na NF.'),
  dimensionalFound: z
    .string()
    .trim()
    .min(1, 'Informe o dimensional encontrado no recebimento.'),
  visualInspection: inspectionCheckResultSchema,
  reportStatus: inspectionCheckResultSchema,
  receiverResponsible: z
    .string()
    .trim()
    .min(1, 'Informe o recebedor responsável.'),
  receiverEmployeeId: z.number().int().positive().nullable().optional(),
});

export type SubmitCertificateInspectionFields = z.infer<
  typeof submitCertificateInspectionSchema
>;

export const certificateInspectionParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID inválido')
    .transform(Number),
  attachmentId: z.string().uuid('Anexo inválido.'),
});

export type CertificateInspectionParams = z.infer<
  typeof certificateInspectionParamsSchema
>;

export const attachConferencePrintParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID inválido')
    .transform(Number),
});

export const attachConferencePrintFieldsSchema = z.object({
  lotIndex: z.coerce
    .number()
    .int('Informe o lote.')
    .min(1, 'Informe o lote.')
    .max(99, 'Lote inválido.'),
});

export type AttachConferencePrintParams = z.infer<
  typeof attachConferencePrintParamsSchema
>;

export const deleteConferencePrintParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID inválido')
    .transform(Number),
  lotIndex: z.coerce
    .number()
    .int('Informe o lote.')
    .min(1, 'Informe o lote.')
    .max(99, 'Lote inválido.'),
});

export type DeleteConferencePrintParams = z.infer<
  typeof deleteConferencePrintParamsSchema
>;

export const attachConferencePrintPasteSchema = z.object({
  lotIndex: z
    .number()
    .int('Informe o lote.')
    .min(1, 'Informe o lote.')
    .max(99, 'Lote inválido.'),
  imageBase64: z.string().min(1, 'Informe a imagem colada.'),
  mimeType: z.string().min(1).optional(),
  fileName: z.string().optional(),
});

export type AttachConferencePrintPasteFields = z.infer<
  typeof attachConferencePrintPasteSchema
>;
