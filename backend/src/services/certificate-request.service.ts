import { randomBytes } from 'node:crypto';
import type {
  CertificateInspection,
  CertificateRequest,
  Prisma,
  PrismaClient,
  QualityDocument,
  RequestAttachment,
  RequestHistoryEvent,
  Supplier,
  User,
} from '../generated/prisma/client.js';
import {
  AttachmentType,
  CertificateRequestStatus,
  InspectionCheckResult,
  RequestHistoryEventType,
  UserRole,
} from '../generated/prisma/enums.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type { CreateCertificateRequestFields } from '../schemas/certificate-request.schemas.js';
import { saveCertificateRequestFile } from '../utils/certificate-request-storage.js';
import { hashToken } from '../utils/token-hash.js';
import {
  sendCompletedCertificateRequestEmail,
  sendNewCertificateRequestEmail,
  resolvePurchaseNotificationRecipients,
} from './email.service.js';
import { UserService } from './user.service.js';

type AttachmentWithInspection = RequestAttachment & {
  inspection:
    | (CertificateInspection & {
        qualityDocument: Pick<
          QualityDocument,
          'id' | 'displayName' | 'year' | 'versionNumber'
        >;
      })
    | null;
};

type RequestWithRelations = CertificateRequest & {
  supplier: Supplier;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  attachments: AttachmentWithInspection[];
  historyEvents: RequestHistoryEvent[];
};

function toPublicInspection(
  inspection: NonNullable<AttachmentWithInspection['inspection']>,
) {
  const isValid =
    inspection.chemicalComposition === InspectionCheckResult.OK &&
    inspection.visualInspection === InspectionCheckResult.OK &&
    inspection.reportStatus === InspectionCheckResult.OK;

  return {
    id: inspection.id,
    attachmentId: inspection.attachmentId,
    requestId: inspection.requestId,
    qualityDocumentId: inspection.qualityDocumentId,
    qualityDocumentName: inspection.qualityDocument.displayName,
    receiptDate: inspection.receiptDate.toISOString().slice(0, 10),
    materialDescription: inspection.materialDescription,
    rm: inspection.rm,
    certificateNumber: inspection.certificateNumber,
    chemicalComposition: inspection.chemicalComposition,
    quantitySpecified: inspection.quantitySpecified,
    quantityFound: inspection.quantityFound,
    dimensionalSpecified: inspection.dimensionalSpecified,
    dimensionalFound: inspection.dimensionalFound,
    visualInspection: inspection.visualInspection,
    reportStatus: inspection.reportStatus,
    receiverResponsible: inspection.receiverResponsible,
    inspectedByUserId: inspection.inspectedByUserId,
    inspectedAt: inspection.inspectedAt.toISOString(),
    isValid,
  };
}

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
      lotIndex: attachment.lotIndex,
      validity: attachment.validity,
      uploadedAt: attachment.uploadedAt.toISOString(),
      inspection: attachment.inspection
        ? toPublicInspection(attachment.inspection)
        : null,
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
      createdBy: { select: { id: true, name: true, email: true } },
      attachments: {
        orderBy: { uploadedAt: 'asc' },
        include: {
          inspection: {
            include: {
              qualityDocument: {
                select: {
                  id: true,
                  displayName: true,
                  year: true,
                  versionNumber: true,
                },
              },
            },
          },
        },
      },
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

  async listCompleted() {
    const requests = await this.prisma.certificateRequest.findMany({
      where: { status: CertificateRequestStatus.CONCLUIDA },
      include: this.includeRelations(),
      orderBy: { completedAt: 'desc' },
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
    invoiceFile: { buffer: Buffer; filename: string } | null,
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
          expectedCertificates: fields.expectedCertificates,
          notes: fields.notes?.trim() || null,
          status: CertificateRequestStatus.AGUARDANDO_COMPRAS,
          createdByUserId: userId,
        },
      });

      const storagePath = invoiceFile
        ? await saveCertificateRequestFile(
            created.id,
            AttachmentType.NOTA_FISCAL,
            invoiceFile.buffer,
            invoiceFile.filename,
          )
        : null;

      if (invoiceFile && storagePath) {
        await tx.requestAttachment.create({
          data: {
            requestId: created.id,
            type: AttachmentType.NOTA_FISCAL,
            fileName: invoiceFile.filename,
            storagePath,
            uploadedByUserId: userId,
          },
        });
      }

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

    const userService = new UserService(this.prisma);
    const purchaseOperatorEmails =
      await userService.listActivePurchaseOperatorEmails();
    const recipients = resolvePurchaseNotificationRecipients(
      purchaseOperatorEmails,
    );

    const emailDispatch = await sendNewCertificateRequestEmail({
      requestId: fullRequest.id,
      supplierName: fullRequest.supplier.name,
      supplierCnpj: fullRequest.supplier.cnpj,
      invoiceNumber: fullRequest.invoiceNumber,
      invoiceDate: fullRequest.invoiceDate,
      expectedCertificates: fullRequest.expectedCertificates,
      notes: fullRequest.notes,
      createdByName: fullRequest.createdByName,
      submittedAt: fullRequest.submittedAt,
      magicLinkUrl,
      recipients,
    });

    await this.prisma.requestHistoryEvent.create({
      data: {
        requestId: fullRequest.id,
        eventType: RequestHistoryEventType.EMAIL_COMPRAS_ENVIADO,
        description: emailDispatch.recipients.length
          ? `E-mail enviado para ${emailDispatch.recipients.join(', ')}.`
          : 'E-mail registrado (nenhum operador de compras com e-mail cadastrado).',
        actorUserId: userId,
      },
    });

    return this.findById(fullRequest.id);
  }

  async listForPurchase() {
    const requests = await this.prisma.certificateRequest.findMany({
      where: {
        status: {
          not: CertificateRequestStatus.CANCELADA,
        },
      },
      include: this.includeRelations(),
      orderBy: { submittedAt: 'desc' },
    });

    return requests.map(toPublicRequest);
  }

  async listPendingForPurchase() {
    const requests = await this.prisma.certificateRequest.findMany({
      where: {
        status: CertificateRequestStatus.AGUARDANDO_COMPRAS,
      },
      include: this.includeRelations(),
      orderBy: { submittedAt: 'desc' },
    });

    return requests.map(toPublicRequest);
  }

  async registerSupplierContact(requestId: number, userId: number) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (request.status !== CertificateRequestStatus.AGUARDANDO_COMPRAS) {
      throw new AppError(
        'Esta solicitação não permite registrar envio ao fornecedor.',
        400,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.certificateRequest.update({
        where: { id: requestId },
        data: {
          status: CertificateRequestStatus.AGUARDANDO_FORNECEDOR,
          supplierContactAt: new Date(),
        },
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.ENVIO_FORNECEDOR_REGISTRADO,
          description: 'Compras registrou envio de e-mail ao fornecedor.',
          actorUserId: userId,
        },
      });
    });

    return this.findById(requestId);
  }

  async attachCertificate(
    requestId: number,
    userId: number,
    certificateFile: { buffer: Buffer; filename: string },
    invoiceFile: { buffer: Buffer; filename: string },
    _lotLabel?: string | null,
  ) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (request.status !== CertificateRequestStatus.AGUARDANDO_FORNECEDOR) {
      throw new AppError(
        'Anexe certificados após registrar o envio ao fornecedor.',
        400,
      );
    }

    const existingCertificates = await this.prisma.requestAttachment.count({
      where: {
        requestId,
        type: AttachmentType.CERTIFICADO,
      },
    });

    if (existingCertificates > 0) {
      throw new AppError(
        'Já existe um PDF de certificados anexado nesta solicitação.',
        400,
      );
    }

    const storagePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.CERTIFICADO,
      certificateFile.buffer,
      certificateFile.filename,
    );

    const invoiceStoragePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.NOTA_FISCAL,
      invoiceFile.buffer,
      invoiceFile.filename,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.requestAttachment.create({
        data: {
          requestId,
          type: AttachmentType.CERTIFICADO,
          fileName: certificateFile.filename,
          storagePath,
          lotLabel: 'Todos os lotes',
          uploadedByUserId: userId,
        },
      });

      const existingInvoice = await tx.requestAttachment.findFirst({
        where: {
          requestId,
          type: AttachmentType.NOTA_FISCAL,
          lotIndex: null,
        },
      });

      if (existingInvoice) {
        await tx.requestAttachment.update({
          where: { id: existingInvoice.id },
          data: {
            fileName: invoiceFile.filename,
            storagePath: invoiceStoragePath,
            uploadedByUserId: userId,
            uploadedAt: new Date(),
          },
        });
      } else {
        await tx.requestAttachment.create({
          data: {
            requestId,
            type: AttachmentType.NOTA_FISCAL,
            fileName: invoiceFile.filename,
            storagePath: invoiceStoragePath,
            uploadedByUserId: userId,
          },
        });
      }

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.CERTIFICADO_ANEXADO,
          description: `PDF único com os certificados anexado: ${certificateFile.filename}. Nota fiscal retornada: ${invoiceFile.filename}.`,
          actorUserId: userId,
        },
      });
    });

    return this.completeRequest(requestId, userId);
  }

  async completeRequest(requestId: number, userId: number) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (request.status === CertificateRequestStatus.CONCLUIDA) {
      return this.findById(requestId);
    }

    if (request.status !== CertificateRequestStatus.AGUARDANDO_FORNECEDOR) {
      throw new AppError(
        'A solicitação não pode ser concluída neste status.',
        400,
      );
    }

    const attachedCertificatesCount = request.attachments.filter(
      (attachment) => attachment.type === AttachmentType.CERTIFICADO,
    ).length;

    if (attachedCertificatesCount < 1) {
      throw new AppError(
        'Anexe o PDF com os certificados antes de concluir a solicitação.',
        400,
      );
    }

    const completedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.certificateRequest.update({
        where: { id: requestId },
        data: {
          status: CertificateRequestStatus.CONCLUIDA,
          completedAt,
        },
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.SOLICITACAO_CONCLUIDA,
          description: 'Solicitação concluída após anexo dos certificados.',
          actorUserId: userId,
        },
      });
    });

    const requestUrl = `${env.APP_BASE_URL}/minhas-solicitacoes`;

    await sendCompletedCertificateRequestEmail({
      requestId,
      supplierName: request.supplier.name,
      invoiceNumber: request.invoiceNumber,
      attachedCertificatesCount,
      stockOperatorName: request.createdBy.name,
      stockOperatorEmail: request.createdBy.email,
      completedAt: completedAt.toISOString(),
      requestUrl,
    });

    await this.prisma.requestHistoryEvent.create({
      data: {
        requestId,
        eventType: RequestHistoryEventType.EMAIL_ESTOQUE_ENVIADO,
        description: request.createdBy.email
          ? `E-mail enviado para ${request.createdBy.email}.`
          : 'E-mail registrado (destinatário não configurado).',
        actorUserId: userId,
      },
    });

    return this.findById(requestId);
  }

  async cancel(requestId: number, userId: number, userRole: UserRole) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (request.status !== CertificateRequestStatus.AGUARDANDO_COMPRAS) {
      throw new AppError(
        'Só é possível cancelar antes do compras registrar o envio ao fornecedor.',
        400,
      );
    }

    if (
      request.createdByUserId !== userId &&
      userRole !== UserRole.SUPERADMIN
    ) {
      throw new AppError('Acesso negado.', 403);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.certificateRequest.update({
        where: { id: requestId },
        data: {
          status: CertificateRequestStatus.CANCELADA,
        },
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.SOLICITACAO_CANCELADA,
          description: 'Solicitação cancelada pelo estoque.',
          actorUserId: userId,
        },
      });
    });

    return this.findById(requestId);
  }
}
