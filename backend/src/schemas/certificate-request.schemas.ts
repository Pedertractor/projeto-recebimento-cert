import z from 'zod';
import {
  AttachmentType,
  AttachmentValidity,
  CertificateRequestStatus,
  RequestHistoryEventType,
} from '../generated/prisma/enums.js';
import { certificateInspectionSchema } from './certificate-inspection.schemas.js';
import { qualityDocumentSchema } from './quality-document.schemas.js';

export const certificateRequestStatusSchema = z.enum(CertificateRequestStatus);
export const attachmentTypeSchema = z.enum(AttachmentType);
export const attachmentValiditySchema = z.enum(AttachmentValidity);
export const requestHistoryEventTypeSchema = z.enum(RequestHistoryEventType);

const supplierSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  cnpj: z.string(),
  logoStoragePath: z.string().nullable(),
});

export const attachmentSchema = z.object({
  id: z.string(),
  type: attachmentTypeSchema,
  fileName: z.string(),
  storagePath: z.string(),
  lotLabel: z.string().nullable(),
  lotIndex: z.number().nullable(),
  validity: attachmentValiditySchema,
  uploadedAt: z.string(),
  inspection: certificateInspectionSchema.nullable().optional(),
});

export const historyEventSchema = z.object({
  id: z.string(),
  eventType: requestHistoryEventTypeSchema,
  description: z.string().nullable(),
  occurredAt: z.string(),
});

export const certificateRequestSchema = z.object({
  id: z.number(),
  supplier: supplierSummarySchema,
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  expectedCertificates: z.number(),
  notes: z.string().nullable(),
  status: certificateRequestStatusSchema,
  createdByUserId: z.number(),
  createdByName: z.string().nullable(),
  submittedAt: z.string(),
  supplierContactAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  attachments: z.array(attachmentSchema).optional(),
  historyEvents: z.array(historyEventSchema).optional(),
  attachedCertificatesCount: z.number().optional(),
  inspectedCertificatesCount: z.number().optional(),
  qualityDocumentId: z.string().nullable().optional(),
  qualityDocumentLocked: z.boolean().optional(),
  qualityDocument: qualityDocumentSchema.nullable().optional(),
});

export type PublicCertificateRequest = z.infer<typeof certificateRequestSchema>;

export const listCertificateRequestsResponseSchema = z.array(
  certificateRequestSchema,
);

export const certificateRequestResponseSchema = certificateRequestSchema;

export const certificateRequestIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID inválido')
    .transform(Number),
});

export type CertificateRequestIdParams = z.infer<
  typeof certificateRequestIdParamsSchema
>;

export const createCertificateRequestFieldsSchema = z.object({
  supplierId: z.coerce.number().int().positive('Selecione um fornecedor.'),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número da nota fiscal.')
    .max(30, 'Número da NF inválido.'),
  invoiceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data da NF.'),
  expectedCertificates: z.coerce
    .number()
    .int('Informe a quantidade de lotes.')
    .min(1, 'Informe pelo menos 1 lote na NF.')
    .max(99, 'Quantidade de lotes inválida.'),
  notes: z.string().trim().optional(),
});

export type CreateCertificateRequestFields = z.infer<
  typeof createCertificateRequestFieldsSchema
>;

export const updateCertificateRequestSchema =
  createCertificateRequestFieldsSchema
    .partial()
    .refine(
      (value) =>
        value.supplierId !== undefined ||
        value.invoiceNumber !== undefined ||
        value.invoiceDate !== undefined ||
        value.expectedCertificates !== undefined ||
        value.notes !== undefined,
      'Informe ao menos um campo para atualizar.',
    );

export type UpdateCertificateRequestFields = z.infer<
  typeof updateCertificateRequestSchema
>;

export const attachCertificateFieldsSchema = z.object({
  lotLabel: z.string().trim().max(100).optional(),
});

export type AttachCertificateFields = z.infer<
  typeof attachCertificateFieldsSchema
>;
