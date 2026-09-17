import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import { AppError } from '../lib/errors.js';
import {
  attachCertificateFieldsSchema,
  createCertificateRequestFieldsSchema,
} from '../schemas/certificate-request.schemas.js';
import type { CertificateRequestIdParams } from '../schemas/certificate-request.schemas.js';
import { CertificateRequestService } from '../services/certificate-request.service.js';

type MultipartFields = Record<string, string>;

async function parseMultipartRequest(
  request: FastifyRequest,
): Promise<{ fields: MultipartFields; file: { buffer: Buffer; filename: string } | null }> {
  const fields: MultipartFields = {};
  let file: { buffer: Buffer; filename: string } | null = null;

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (part.fieldname === 'invoiceFile' && !file) {
        const buffer = await part.toBuffer();
        file = {
          buffer,
          filename: part.filename || 'nota-fiscal.pdf',
        };
      }

      if (part.fieldname === 'certificateFile' && !file) {
        const buffer = await part.toBuffer();
        file = {
          buffer,
          filename: part.filename || 'certificado.pdf',
        };
      }

      continue;
    }

    fields[part.fieldname] = String(part.value ?? '');
  }

  return { fields, file };
}

function canAccessCertificateRequest(
  request: { createdByUserId: number },
  user: { id: number; role: UserRole },
): boolean {
  if (user.role === UserRole.SUPERADMIN) {
    return true;
  }

  if (user.role === UserRole.PURCHASE_OPERATOR) {
    return true;
  }

  if (user.role === UserRole.STOCK_OPERATOR) {
    return request.createdByUserId === user.id;
  }

  return false;
}

export async function listCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listForStock(req.user.id);
  return reply.send(requests);
}

export async function listPurchaseCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listForPurchase();
  return reply.send(requests);
}

export async function listPendingPurchaseCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listPendingForPurchase();
  return reply.send(requests);
}

export async function listRecentCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listRecent();
  return reply.send(requests);
}

export async function getCertificateRequestController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const request = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(request, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  return reply.send(request);
}

export async function createCertificateRequestController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { fields, file } = await parseMultipartRequest(req);

  if (!file) {
    throw new AppError('Anexe a nota fiscal.');
  }

  const parsed = createCertificateRequestFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const service = new CertificateRequestService(req.server.prisma);
  const request = await service.create(req.user.id, parsed.data, file);
  return reply.status(201).send(request);
}

export async function registerSupplierContactController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.registerSupplierContact(
    req.params.id,
    req.user.id,
  );

  return reply.send(request);
}

export async function attachCertificateController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const { fields, file } = await parseMultipartRequest(req);

  if (!file) {
    throw new AppError('Anexe o certificado.');
  }

  const parsed = attachCertificateFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.attachCertificate(
    req.params.id,
    req.user.id,
    file,
    parsed.data.lotLabel,
  );

  return reply.send(request);
}

export async function completeCertificateRequestController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.completeRequest(req.params.id, req.user.id);
  return reply.send(request);
}

export async function cancelCertificateRequestController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const request = await service.cancel(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  return reply.send(request);
}
