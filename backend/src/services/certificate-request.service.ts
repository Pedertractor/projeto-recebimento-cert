import { randomBytes } from 'node:crypto';
import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import {
  AttachmentType,
  CertificateRequestStatus,
  InspectionCheckResult,
  RequestHistoryEventType,
  UserRole,
} from '../generated/prisma/enums.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type {
  CreateCertificateRequestFields,
  UpdateCertificateRequestFields,
} from '../schemas/certificate-request.schemas.js';
import { saveCertificateRequestFile } from '../utils/certificate-request-storage.js';
import { hashToken } from '../utils/token-hash.js';
import {
  sendCompletedCertificateRequestEmail,
  sendNewCertificateRequestEmail,
  resolvePurchaseNotificationRecipients,
} from './email.service.js';
import { UserService } from './user.service.js';

const certificateRequestInclude = {
  supplier: true,
  createdBy: { select: { id: true, name: true, email: true } },
  attachments: {
    orderBy: { uploadedAt: 'asc' as const },
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
  historyEvents: { orderBy: { occurredAt: 'asc' as const } },
} satisfies Prisma.CertificateRequestInclude;

type RequestWithRelations = Prisma.CertificateRequestGetPayload<{
  include: typeof certificateRequestInclude;
}>;

type AttachmentWithInspection = RequestWithRelations['attachments'][number];

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
    receiverEmployeeId: inspection.receiverEmployeeId ?? null,
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

  const inspectedCertificatesCount = new Set(
    request.attachments
      .filter(
        (attachment) =>
          attachment.type === AttachmentType.IMPRESSAO_CONFERENCIA &&
          attachment.inspection != null &&
          attachment.lotIndex != null,
      )
      .map((attachment) => attachment.lotIndex),
  ).size;

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
    inspectedCertificatesCount,
  };
}

export class CertificateRequestService {
  constructor(private readonly prisma: PrismaClient) {}

  private includeRelations() {
    return certificateRequestInclude;
  }

  private async replaceMainInvoiceDocument(
    tx: Prisma.TransactionClient,
    params: {
      requestId: number;
      userId: number;
      fileName: string;
      storagePath: string;
      type:
        typeof AttachmentType.NOTA_FISCAL | typeof AttachmentType.CERTIFICADO;
    },
  ) {
    await tx.requestAttachment.deleteMany({
      where: {
        requestId: params.requestId,
        lotIndex: null,
        type: {
          in: [AttachmentType.NOTA_FISCAL, AttachmentType.CERTIFICADO],
        },
      },
    });

    await tx.requestAttachment.create({
      data: {
        requestId: params.requestId,
        type: params.type,
        fileName: params.fileName,
        storagePath: params.storagePath,
        uploadedByUserId: params.userId,
      },
    });
  }

  async listForStock(userId: number) {
    const requests = await this.prisma.certificateRequest.findMany({
      where: {
        createdByUserId: userId,
        status: { not: CertificateRequestStatus.CADASTRADA },
      },
      include: this.includeRelations(),
      orderBy: { submittedAt: 'desc' },
    });

    return requests.map(toPublicRequest);
  }

  async listCompleted(userId: number) {
    const requests = await this.prisma.certificateRequest.findMany({
      where: {
        status: { not: CertificateRequestStatus.CANCELADA },
        OR: [
          { status: CertificateRequestStatus.CONCLUIDA },
          { createdByUserId: userId },
        ],
      },
      include: this.includeRelations(),
      orderBy: [{ completedAt: 'desc' }, { submittedAt: 'desc' }],
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

    const request = await this.prisma.$transaction(async (tx) => {
      const created = await tx.certificateRequest.create({
        data: {
          supplierId: fields.supplierId,
          invoiceNumber,
          invoiceDate,
          expectedCertificates: fields.expectedCertificates,
          notes: fields.notes?.trim() || null,
          status: CertificateRequestStatus.CADASTRADA,
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
          description: 'NF de materiais cadastrada pelo estoque.',
          actorUserId: userId,
        },
      });

      return created.id;
    });

    return this.findById(request);
  }

  async update(
    requestId: number,
    _userId: number,
    fields: UpdateCertificateRequestFields,
  ) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
      include: { attachments: true },
    });

    if (!request) {
      throw new AppError('NF não encontrada.', 404);
    }

    if (request.status === CertificateRequestStatus.CANCELADA) {
      throw new AppError('Não é possível editar uma NF cancelada.', 400);
    }

    if (fields.supplierId && fields.supplierId !== request.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: fields.supplierId },
      });

      if (!supplier) {
        throw new AppError('Fornecedor não encontrado.', 404);
      }
    }

    if (
      fields.expectedCertificates != null &&
      fields.expectedCertificates < request.expectedCertificates
    ) {
      const highestLotIndex = request.attachments.reduce(
        (highest, attachment) => {
          if (attachment.lotIndex == null) {
            return highest;
          }
          return Math.max(highest, attachment.lotIndex);
        },
        0,
      );

      if (fields.expectedCertificates < highestLotIndex) {
        throw new AppError(
          `Já existem anexos no lote ${highestLotIndex}. Não é possível reduzir para ${fields.expectedCertificates} lote(s).`,
        );
      }
    }

    let invoiceDate: Date | undefined;
    if (fields.invoiceDate) {
      invoiceDate = new Date(`${fields.invoiceDate}T00:00:00.000Z`);
      if (Number.isNaN(invoiceDate.getTime())) {
        throw new AppError('Data da NF inválida.');
      }
    }

    await this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: {
        ...(fields.supplierId ? { supplierId: fields.supplierId } : {}),
        ...(fields.invoiceNumber
          ? { invoiceNumber: fields.invoiceNumber.trim() }
          : {}),
        ...(invoiceDate ? { invoiceDate } : {}),
        ...(fields.expectedCertificates != null
          ? { expectedCertificates: fields.expectedCertificates }
          : {}),
        ...(fields.notes !== undefined
          ? { notes: fields.notes.trim() || null }
          : {}),
      },
    });

    return this.findById(requestId);
  }

  async upsertInvoice(
    requestId: number,
    userId: number,
    invoiceFile: { buffer: Buffer; filename: string },
  ) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('NF não encontrada.', 404);
    }

    if (request.status === CertificateRequestStatus.CANCELADA) {
      throw new AppError(
        'Não é possível atualizar a NF de uma solicitação cancelada.',
        400,
      );
    }

    const storagePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.NOTA_FISCAL,
      invoiceFile.buffer,
      invoiceFile.filename,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.replaceMainInvoiceDocument(tx, {
        requestId,
        userId,
        fileName: invoiceFile.filename,
        storagePath,
        type: AttachmentType.NOTA_FISCAL,
      });
    });

    return this.findById(requestId);
  }

  async requestDocumentFromPurchase(requestId: number, userId: number) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
      include: { magicLink: true },
    });

    if (!request) {
      throw new AppError('NF não encontrada.', 404);
    }

    const hadPurchaseRequestSent =
      request.status === CertificateRequestStatus.CANCELADA
        ? (await this.prisma.requestHistoryEvent.count({
            where: {
              requestId,
              eventType: RequestHistoryEventType.EMAIL_COMPRAS_ENVIADO,
            },
          })) > 0
        : false;

    const canRequestDocument =
      request.status === CertificateRequestStatus.CADASTRADA ||
      hadPurchaseRequestSent;

    if (!canRequestDocument) {
      throw new AppError(
        'Esta NF já possui uma solicitação de documento em andamento.',
        400,
      );
    }

    const existingCertificate = await this.prisma.requestAttachment.count({
      where: {
        requestId,
        type: AttachmentType.CERTIFICADO,
      },
    });

    if (existingCertificate > 0) {
      throw new AppError(
        'Esta NF já possui o PDF de certificados vinculado.',
        400,
      );
    }

    let rawToken = randomBytes(32).toString('hex');

    await this.prisma.$transaction(async (tx) => {
      if (request.status === CertificateRequestStatus.CANCELADA) {
        await tx.certificateRequest.update({
          where: { id: requestId },
          data: {
            status: CertificateRequestStatus.CADASTRADA,
          },
        });
      }

      await tx.certificateRequest.update({
        where: { id: requestId },
        data: {
          status: CertificateRequestStatus.AGUARDANDO_COMPRAS,
          submittedAt: new Date(),
        },
      });

      if (request.magicLink) {
        rawToken = randomBytes(32).toString('hex');
        await tx.magicLink.update({
          where: { id: request.magicLink.id },
          data: {
            tokenHash: hashToken(rawToken),
            usedAt: null,
            expiresAt: (() => {
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 30);
              return expiresAt;
            })(),
          },
        });
      } else {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await tx.magicLink.create({
          data: {
            requestId,
            tokenHash: hashToken(rawToken),
            expiresAt,
          },
        });
      }
    });

    const fullRequest = await this.findById(requestId);
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
          ? `Solicitação de documento enviada ao compras (${emailDispatch.recipients.join(', ')}).`
          : 'Solicitação de documento registrada (nenhum operador de compras com e-mail cadastrado).',
        actorUserId: userId,
      },
    });

    return this.findById(fullRequest.id);
  }

  async listForPurchase() {
    const requests = await this.prisma.certificateRequest.findMany({
      where: {
        status: {
          notIn: [
            CertificateRequestStatus.CANCELADA,
            CertificateRequestStatus.CADASTRADA,
          ],
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
        'Anexe o documento após registrar o envio ao fornecedor.',
        400,
      );
    }

    const storagePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.CERTIFICADO,
      certificateFile.buffer,
      certificateFile.filename,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.replaceMainInvoiceDocument(tx, {
        requestId,
        userId,
        fileName: certificateFile.filename,
        storagePath,
        type: AttachmentType.CERTIFICADO,
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.CERTIFICADO_ANEXADO,
          description: `NF com certificados anexada pelo compras: ${certificateFile.filename}.`,
          actorUserId: userId,
        },
      });
    });

    return this.completeRequest(requestId, userId);
  }

  async linkCertificatePdf(
    requestId: number,
    userId: number,
    certificateFile: { buffer: Buffer; filename: string },
  ) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('NF não encontrada.', 404);
    }

    if (request.status !== CertificateRequestStatus.CADASTRADA) {
      throw new AppError(
        'Vincule o PDF enquanto a NF ainda não foi enviada ao compras.',
        400,
      );
    }

    const storagePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.CERTIFICADO,
      certificateFile.buffer,
      certificateFile.filename,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.replaceMainInvoiceDocument(tx, {
        requestId,
        userId,
        fileName: certificateFile.filename,
        storagePath,
        type: AttachmentType.CERTIFICADO,
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.CERTIFICADO_ANEXADO,
          description: `PDF com a NF e os certificados vinculado pelo estoque: ${certificateFile.filename}.`,
          actorUserId: userId,
        },
      });
    });

    return this.completeRequest(requestId, userId, { notifyStock: false });
  }

  async completeRequest(
    requestId: number,
    userId: number,
    options?: { notifyStock?: boolean },
  ) {
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

    if (
      request.status !== CertificateRequestStatus.AGUARDANDO_FORNECEDOR &&
      request.status !== CertificateRequestStatus.CADASTRADA
    ) {
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

    const notifyStock = options?.notifyStock ?? true;

    const requestUrl = `${env.APP_BASE_URL}/notas-fiscais/${requestId}`;

    if (notifyStock) {
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
    }

    return this.findById(requestId);
  }

  async cancel(requestId: number, userId: number, userRole: UserRole) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (
      request.status !== CertificateRequestStatus.AGUARDANDO_COMPRAS &&
      request.status !== CertificateRequestStatus.CADASTRADA
    ) {
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

    const revertingPurchaseRequest =
      request.status === CertificateRequestStatus.AGUARDANDO_COMPRAS;

    await this.prisma.$transaction(async (tx) => {
      await tx.certificateRequest.update({
        where: { id: requestId },
        data: {
          status: revertingPurchaseRequest
            ? CertificateRequestStatus.CADASTRADA
            : CertificateRequestStatus.CANCELADA,
        },
      });

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.SOLICITACAO_CANCELADA,
          description: revertingPurchaseRequest
            ? 'Solicitação ao compras cancelada pelo estoque. A NF voltou ao status cadastrada.'
            : 'Solicitação cancelada pelo estoque.',
          actorUserId: userId,
        },
      });
    });

    return this.findById(requestId);
  }
}
