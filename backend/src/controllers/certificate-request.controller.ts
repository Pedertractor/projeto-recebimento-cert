import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';
import { createCertificateRequestFieldsSchema } from '../schemas/certificate-request.schemas.js';
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
      continue;
    }

    fields[part.fieldname] = String(part.value ?? '');
  }

  return { fields, file };
}

export async function listCertificateRequestsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const requests = await service.listForStock(req.user.id);
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

  if (
    request.createdByUserId !== req.user.id &&
    req.user.role !== 'SUPERADMIN'
  ) {
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
