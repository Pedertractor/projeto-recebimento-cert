import type { Multipart, MultipartFile } from '@fastify/multipart';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CertificateRequestStatus, UserRole } from '../generated/prisma/enums.js';
import { AppError } from '../lib/errors.js';
import {
  attachConferencePrintFieldsSchema,
  attachConferencePrintPasteSchema,
  submitCertificateInspectionSchema,
} from '../schemas/certificate-inspection.schemas.js';
import type {
  AttachConferencePrintParams,
  CertificateInspectionParams,
} from '../schemas/certificate-inspection.schemas.js';
import { CertificateInspectionService } from '../services/certificate-inspection.service.js';
import { CertificateRequestService } from '../services/certificate-request.service.js';

type MultipartFields = Record<string, string>;

function isMultipartFile(value: Multipart): value is MultipartFile {
  return 'toBuffer' in value;
}

function multipartFieldString(
  fieldValue: Multipart | Multipart[] | undefined,
): string {
  const item = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
  if (!item || isMultipartFile(item)) {
    return '';
  }

  return String(item.value ?? '');
}

async function parseConferencePrintMultipart(
  request: FastifyRequest,
): Promise<{ fields: MultipartFields; file: { buffer: Buffer; filename: string } | null }> {
  const data = await request.file();

  if (!data) {
    return { fields: {}, file: null };
  }

  const fields: MultipartFields = {};
  for (const [fieldName, fieldValue] of Object.entries(data.fields)) {
    fields[fieldName] = multipartFieldString(fieldValue);
  }

  const buffer = await data.toBuffer();
  const file = {
    buffer,
    filename: data.filename || 'certificado.png',
  };

  return { fields, file };
}

function canAccessConferenceRequest(
  request: { createdByUserId: number; status: CertificateRequestStatus },
  user: { id: number; role: UserRole },
): boolean {
  if (user.role === UserRole.SUPERADMIN) {
    return true;
  }

  if (user.role === UserRole.STOCK_OPERATOR) {
    return request.status === CertificateRequestStatus.CONCLUIDA;
  }

  return false;
}

function canAttachConferencePrint(
  request: { createdByUserId: number; status: CertificateRequestStatus },
  user: { id: number; role: UserRole },
): boolean {
  if (user.role === UserRole.SUPERADMIN) {
    return true;
  }

  if (user.role !== UserRole.STOCK_OPERATOR) {
    return false;
  }

  if (request.status === CertificateRequestStatus.CANCELADA) {
    return false;
  }

  if (request.status === CertificateRequestStatus.CONCLUIDA) {
    return true;
  }

  return request.createdByUserId === user.id;
}

export async function listCompletedCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listCompleted(req.user.id);
  return reply.send(requests);
}

export async function getCurrentQualityDocumentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateInspectionService(req.server.prisma);
  const document = await service.getCurrentQualityDocument();
  return reply.send(document);
}

export async function attachConferencePrintController(
  req: FastifyRequest<{ Params: AttachConferencePrintParams }>,
  reply: FastifyReply,
) {
  const requestId = Number(req.params.id);
  const { fields, file } = await parseConferencePrintMultipart(req);
  if (!file) {
    throw new AppError('Anexe a impressão do certificado.');
  }

  const parsedFields = attachConferencePrintFieldsSchema.safeParse(fields);
  if (!parsedFields.success) {
    throw new AppError(parsedFields.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const requestService = new CertificateRequestService(req.server.prisma);
  const existing = await requestService.findById(requestId);

  if (!canAttachConferencePrint(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const inspectionService = new CertificateInspectionService(req.server.prisma);
  await inspectionService.attachConferencePrint(
    requestId,
    parsedFields.data.lotIndex,
    req.user.id,
    file,
  );

  const request = await requestService.findById(requestId);
  return reply.send(request);
}

export async function attachConferencePrintPasteController(
  req: FastifyRequest<{ Params: AttachConferencePrintParams }>,
  reply: FastifyReply,
) {
  const requestId = Number(req.params.id);
  const parsed = attachConferencePrintPasteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const normalizedBase64 = parsed.data.imageBase64.includes(',')
    ? (parsed.data.imageBase64.split(',').pop() ?? '')
    : parsed.data.imageBase64;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(normalizedBase64, 'base64');
  } catch {
    throw new AppError('Imagem colada inválida.', 400);
  }

  if (buffer.length === 0) {
    throw new AppError('Imagem colada vazia.', 400);
  }

  if (buffer.length > 15 * 1024 * 1024) {
    throw new AppError('Imagem colada excede o limite de 15 MB.', 400);
  }

  const mimeType = parsed.data.mimeType || 'image/png';
  const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
  const filename =
    parsed.data.fileName?.trim() ||
    `lote-${parsed.data.lotIndex}-print.${extension}`;

  const requestService = new CertificateRequestService(req.server.prisma);
  const existing = await requestService.findById(requestId);

  if (!canAttachConferencePrint(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const inspectionService = new CertificateInspectionService(req.server.prisma);
  await inspectionService.attachConferencePrint(
    requestId,
    parsed.data.lotIndex,
    req.user.id,
    { buffer, filename },
  );

  const request = await requestService.findById(requestId);
  return reply.send(request);
}

export async function submitCertificateInspectionController(
  req: FastifyRequest<{ Params: CertificateInspectionParams }>,
  reply: FastifyReply,
) {
  const requestId = Number(req.params.id);
  const attachmentId = req.params.attachmentId;
  const parsed = submitCertificateInspectionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const requestService = new CertificateRequestService(req.server.prisma);
  const existing = await requestService.findById(requestId);

  if (!canAccessConferenceRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const inspectionService = new CertificateInspectionService(req.server.prisma);
  const inspection = await inspectionService.submitInspection(
    requestId,
    attachmentId,
    req.user.id,
    parsed.data,
  );

  return reply.status(201).send(inspection);
}
