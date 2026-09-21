import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  CertificateRequestStatus,
  UserRole,
} from '../generated/prisma/enums.js';
import { AppError } from '../lib/errors.js';
import {
  attachCertificateFieldsSchema,
  createCertificateRequestFieldsSchema,
  updateCertificateRequestSchema,
} from '../schemas/certificate-request.schemas.js';
import type {
  CertificateRequestIdParams,
  UpdateCertificateRequestFields,
} from '../schemas/certificate-request.schemas.js';
import { CertificateRequestService } from '../services/certificate-request.service.js';

type MultipartFields = Record<string, string>;

type MultipartFile = { buffer: Buffer; filename: string };

type ParsedMultipartFiles = Partial<
  Record<'invoiceFile' | 'certificateFile', MultipartFile>
>;

async function parseMultipartRequest(
  request: FastifyRequest,
): Promise<{ fields: MultipartFields; files: ParsedMultipartFiles }> {
  const fields: MultipartFields = {};
  const files: ParsedMultipartFiles = {};

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (
        part.fieldname === 'invoiceFile' ||
        part.fieldname === 'certificateFile'
      ) {
        const buffer = await part.toBuffer();
        if (buffer.length > 0) {
          files[part.fieldname] = {
            buffer,
            filename:
              part.filename ||
              (part.fieldname === 'certificateFile'
                ? 'certificado.pdf'
                : 'nota-fiscal.pdf'),
          };
        }
      }

      continue;
    }

    fields[part.fieldname] = String(part.value ?? '');
  }

  return { fields, files };
}

function canAccessCertificateRequest(
  request: { createdByUserId: number; status: CertificateRequestStatus },
  user: { id: number; role: UserRole },
): boolean {
  if (user.role === UserRole.SUPERADMIN) {
    return true;
  }

  if (user.role === UserRole.PURCHASE_OPERATOR) {
    return request.status !== CertificateRequestStatus.CADASTRADA;
  }

  if (user.role === UserRole.STOCK_OPERATOR) {
    if (request.status === CertificateRequestStatus.CONCLUIDA) {
      return true;
    }

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
  const { fields, files } = await parseMultipartRequest(req);

  const parsed = createCertificateRequestFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const invoiceFile = files.invoiceFile ?? null;

  const service = new CertificateRequestService(req.server.prisma);
  const request = await service.create(req.user.id, parsed.data, invoiceFile);
  return reply.status(201).send(request);
}

export async function updateCertificateRequestController(
  req: FastifyRequest<{
    Params: CertificateRequestIdParams;
    Body: UpdateCertificateRequestFields;
  }>,
  reply: FastifyReply,
) {
  const parsed = updateCertificateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.update(req.params.id, req.user.id, parsed.data);
  return reply.send(request);
}

export async function upsertInvoiceController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const { files } = await parseMultipartRequest(req);
  const invoiceFile = files.invoiceFile;

  if (!invoiceFile) {
    throw new AppError('Anexe o arquivo da nota fiscal.');
  }

  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.upsertInvoice(
    req.params.id,
    req.user.id,
    invoiceFile,
  );
  return reply.send(request);
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
  const { fields, files } = await parseMultipartRequest(req);

  const certificateFile = files.certificateFile;

  if (!certificateFile) {
    throw new AppError('Anexe o PDF com a NF e os certificados.');
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
    certificateFile,
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

export async function requestDocumentFromPurchaseController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.requestDocumentFromPurchase(
    req.params.id,
    req.user.id,
  );

  return reply.send(request);
}

export async function linkCertificatePdfController(
  req: FastifyRequest<{ Params: CertificateRequestIdParams }>,
  reply: FastifyReply,
) {
  const { files } = await parseMultipartRequest(req);
  const certificateFile = files.certificateFile;

  if (!certificateFile) {
    throw new AppError('Anexe o PDF com a NF e os certificados.');
  }

  const service = new CertificateRequestService(req.server.prisma);
  const existing = await service.findById(req.params.id);

  if (!canAccessCertificateRequest(existing, req.user)) {
    throw new AppError('Acesso negado.', 403);
  }

  const request = await service.linkCertificatePdf(
    req.params.id,
    req.user.id,
    certificateFile,
  );

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
