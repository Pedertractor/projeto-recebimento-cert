import { randomBytes } from 'node:crypto';
import type {
  CertificateRequest,
  Prisma,
  PrismaClient,
  RequestAttachment,
  RequestHistoryEvent,
  Supplier,
  User,
} from '../generated/prisma/client.js';
import {
  AttachmentType,
  CertificateRequestStatus,
  RequestHistoryEventType,
} from '../generated/prisma/enums.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type { CreateCertificateRequestFields } from '../schemas/certificate-request.schemas.js';
import { saveCertificateRequestFile } from '../utils/certificate-request-storage.js';
import { hashToken } from '../utils/token-hash.js';
import { sendNewCertificateRequestEmail } from './email.service.js';

type RequestWithRelations = CertificateRequest & {
  supplier: Supplier;
  createdBy: Pick<User, 'id' | 'name'>;
  attachments: RequestAttachment[];
  historyEvents: RequestHistoryEvent[];
};

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toPublicRequest(request: RequestWithRelations) {
  const attachedCertificatesCount = request.attachments.filter(
    (attachment) => attachment.type === AttachmentType.CERTIFICADO,
  ).length;

  return {
    id: request.id,
    supplier: {
      id: request.supplier.id,
      name: request.supplier.name,
      cnpj: request.supplier.cnpj,
    },
    invoiceNumber: request.invoiceNumber,
    invoiceDate: toIsoDate(request.invoiceDate),
    expectedCertificates: request.expectedCertificates,
    notes: request.notes,
    status: request.status,
    createdByUserId: request.createdByUserId,
    createdByName: request.createdBy.name,
    submittedAt: request.submittedAt.toISOString(),
    supplierContactAt: request.supplierContactAt?.toISOString() ?? null,
    completedAt: request.completedAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    attachments: request.attachments.map((attachment) => ({
      id: attachment.id,
      type: attachment.type,
      fileName: attachment.fileName,
      storagePath: attachment.storagePath,
      lotLabel: attachment.lotLabel,
      uploadedAt: attachment.uploadedAt.toISOString(),
    })),
    historyEvents: request.historyEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      description: event.description,
      occurredAt: event.occurredAt.toISOString(),
    })),
    attachedCertificatesCount,
  };
}

export class CertificateRequestService {
  constructor(private readonly prisma: PrismaClient) {}

  private includeRelations(): Prisma.CertificateRequestInclude {
    return {
      supplier: true,
      createdBy: { select: { id: true, name: true } },
      attachments: { orderBy: { uploadedAt: 'asc' } },
      historyEvents: { orderBy: { occurredAt: 'asc' } },
    };
  }

  async listForStock(userId: number) {
    const requests = await this.prisma.certificateRequest.findMany({
      where: { createdByUserId: userId },
      include: this.includeRelations(),
      orderBy: { submittedAt: 'desc' },
    });

    return requests.map(toPublicRequest);
  }

  async listRecent(limit = 5) {
    const requests = await this.prisma.certificateRequest.findMany({
      include: this.includeRelations(),
      orderBy: { submittedAt: 'desc' },
      take: limit,
    });

    return requests.map(toPublicRequest);
  }

  async findById(id: number) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    return toPublicRequest(request);
  }

  async create(
    userId: number,
    fields: CreateCertificateRequestFields,
    invoiceFile: { buffer: Buffer; filename: string },
  ) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: fields.supplierId },
    });

    if (!supplier) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    const invoiceNumber = fields.invoiceNumber.trim();

    const invoiceDate = new Date(`${fields.invoiceDate}T00:00:00.000Z`);
    if (Number.isNaN(invoiceDate.getTime())) {
      throw new AppError('Data da NF inválida.');
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const request = await this.prisma.$transaction(async (tx) => {
      const created = await tx.certificateRequest.create({
        data: {
          supplierId: fields.supplierId,
          invoiceNumber,
          invoiceDate,
          notes: fields.notes?.trim() || null,
          status: CertificateRequestStatus.AGUARDANDO_COMPRAS,
          createdByUserId: userId,
        },
      });

      const storagePath = await saveCertificateRequestFile(
        created.id,
        AttachmentType.NOTA_FISCAL,
        invoiceFile.buffer,
        invoiceFile.filename,
      );

      await tx.requestAttachment.create({
        data: {
          requestId: created.id,
          type: AttachmentType.NOTA_FISCAL,
          fileName: invoiceFile.filename,
          storagePath,
          uploadedByUserId: userId,
        },
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId: created.id,
          eventType: RequestHistoryEventType.SOLICITACAO_CRIADA,
          description: 'Solicitação aberta pelo estoque.',
          actorUserId: userId,
        },
      });

      await tx.magicLink.create({
        data: {
          requestId: created.id,
          tokenHash,
          expiresAt,
        },
      });

      return created.id;
    });

    const fullRequest = await this.findById(request);
    const magicLinkUrl = `${env.APP_BASE_URL}/solicitacoes/${fullRequest.id}?token=${rawToken}`;

    await sendNewCertificateRequestEmail({
      requestId: fullRequest.id,
      supplierName: fullRequest.supplier.name,
      supplierCnpj: fullRequest.supplier.cnpj,
      invoiceNumber: fullRequest.invoiceNumber,
      invoiceDate: fullRequest.invoiceDate,
      notes: fullRequest.notes,
      magicLinkUrl,
    });

    await this.prisma.requestHistoryEvent.create({
      data: {
        requestId: fullRequest.id,
        eventType: RequestHistoryEventType.EMAIL_COMPRAS_ENVIADO,
        description: env.EMAIL_COMPRAS
          ? `E-mail enviado para ${env.EMAIL_COMPRAS}.`
          : 'E-mail registrado (destinatário não configurado).',
        actorUserId: userId,
      },
    });

    return this.findById(fullRequest.id);
  }
}
