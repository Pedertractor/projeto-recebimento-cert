import type {
  CertificateInspection,
  PrismaClient,
  QualityDocument,
} from '../generated/prisma/client.js';
import {
  AttachmentType,
  AttachmentValidity,
  CertificateRequestStatus,
  InspectionCheckResult,
  RequestHistoryEventType,
} from '../generated/prisma/enums.js';
import { AppError } from '../lib/errors.js';
import type { SubmitCertificateInspectionFields } from '../schemas/certificate-inspection.schemas.js';
import { saveCertificateRequestFile } from '../utils/certificate-request-storage.js';

type InspectionWithDocument = CertificateInspection & {
  qualityDocument: Pick<QualityDocument, 'id' | 'displayName' | 'year' | 'versionNumber'>;
};

function toPublicInspection(inspection: InspectionWithDocument) {
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

export class CertificateInspectionService {
  constructor(private readonly prisma: PrismaClient) {}

  async getCurrentQualityDocument() {
    const document = await this.prisma.qualityDocument.findFirst({
      orderBy: [{ year: 'desc' }, { versionNumber: 'desc' }],
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    if (!document) {
      throw new AppError('Nenhum documento de qualidade cadastrado.', 404);
    }

    return {
      id: document.id,
      year: document.year,
      versionNumber: document.versionNumber,
      displayName: document.displayName,
      fileName: document.fileName,
      storagePath: document.storagePath,
      uploadedByUserId: document.uploadedByUserId,
      uploadedByName: document.uploadedBy.name,
      createdAt: document.createdAt.toISOString(),
    };
  }

  async attachConferencePrint(
    requestId: number,
    lotIndex: number,
    userId: number,
    file: { buffer: Buffer; filename: string },
  ) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
      include: {
        attachments: {
          include: { inspection: true },
        },
      },
    });

    if (!request) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (request.status !== CertificateRequestStatus.CONCLUIDA) {
      throw new AppError(
        'Só é possível anexar impressões em solicitações concluídas.',
        400,
      );
    }

    if (lotIndex < 1 || lotIndex > request.expectedCertificates) {
      throw new AppError('Lote inválido para esta NF.', 400);
    }

    const existingPrint = request.attachments.find(
      (attachment) =>
        attachment.type === AttachmentType.IMPRESSAO_CONFERENCIA &&
        attachment.lotIndex === lotIndex,
    );

    if (existingPrint?.inspection) {
      throw new AppError(
        'Este lote já foi conferido e não pode receber nova impressão.',
        400,
      );
    }

    const storagePath = await saveCertificateRequestFile(
      requestId,
      AttachmentType.IMPRESSAO_CONFERENCIA,
      file.buffer,
      file.filename,
    );

    await this.prisma.$transaction(async (tx) => {
      if (existingPrint) {
        await tx.requestAttachment.delete({
          where: { id: existingPrint.id },
        });
      }

      await tx.requestAttachment.create({
        data: {
          requestId,
          type: AttachmentType.IMPRESSAO_CONFERENCIA,
          fileName: file.filename,
          storagePath,
          lotIndex,
          lotLabel: `Lote ${lotIndex}`,
          uploadedByUserId: userId,
        },
      });
    });
  }

  async submitInspection(
    requestId: number,
    attachmentId: string,
    userId: number,
    fields: SubmitCertificateInspectionFields,
  ) {
    const attachment = await this.prisma.requestAttachment.findUnique({
      where: { id: attachmentId },
      include: { inspection: true },
    });

    if (!attachment || attachment.requestId !== requestId) {
      throw new AppError('Anexo não encontrado.', 404);
    }

    if (attachment.type !== AttachmentType.IMPRESSAO_CONFERENCIA) {
      throw new AppError('Este anexo não pode ser conferido.', 400);
    }

    if (attachment.inspection) {
      throw new AppError('Este certificado já foi conferido.', 400);
    }

    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== CertificateRequestStatus.CONCLUIDA) {
      throw new AppError('Solicitação não disponível para conferência.', 400);
    }

    const qualityDocument = await this.prisma.qualityDocument.findFirst({
      orderBy: [{ year: 'desc' }, { versionNumber: 'desc' }],
    });

    if (!qualityDocument) {
      throw new AppError('Nenhum documento de qualidade cadastrado.', 404);
    }

    const receiptDate = new Date(`${fields.receiptDate}T00:00:00.000Z`);
    if (Number.isNaN(receiptDate.getTime())) {
      throw new AppError('Data do recebimento inválida.', 400);
    }

    const hasNok =
      fields.chemicalComposition === InspectionCheckResult.NOK ||
      fields.visualInspection === InspectionCheckResult.NOK ||
      fields.reportStatus === InspectionCheckResult.NOK;

    const lotLabel = attachment.lotLabel ?? `Lote ${attachment.lotIndex}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.certificateInspection.create({
        data: {
          attachmentId,
          requestId,
          qualityDocumentId: qualityDocument.id,
          receiptDate,
          materialDescription: fields.materialDescription.trim(),
          rm: fields.rm.trim(),
          certificateNumber: fields.certificateNumber.trim(),
          chemicalComposition: fields.chemicalComposition,
          quantitySpecified: fields.quantitySpecified.trim(),
          quantityFound: fields.quantityFound.trim(),
          dimensionalSpecified: fields.dimensionalSpecified.trim(),
          dimensionalFound: fields.dimensionalFound.trim(),
          visualInspection: fields.visualInspection,
          reportStatus: fields.reportStatus,
          receiverResponsible: fields.receiverResponsible.trim(),
          inspectedByUserId: userId,
        },
      });

      if (hasNok) {
        await tx.requestAttachment.update({
          where: { id: attachmentId },
          data: { validity: AttachmentValidity.INVALID },
        });

        await tx.requestHistoryEvent.create({
          data: {
            requestId,
            eventType: RequestHistoryEventType.CERTIFICADO_INVALIDADO,
            description: `Certificado invalidado na conferência (${lotLabel}).`,
            actorUserId: userId,
          },
        });
      }

      await tx.requestHistoryEvent.create({
        data: {
          requestId,
          eventType: RequestHistoryEventType.CONFERENCIA_REALIZADA,
          description: hasNok
            ? `Conferência concluída com reprovação (${lotLabel}).`
            : `Conferência concluída com aprovação (${lotLabel}).`,
          actorUserId: userId,
        },
      });
    });

    const inspection = await this.prisma.certificateInspection.findUnique({
      where: { attachmentId },
      include: {
        qualityDocument: {
          select: { id: true, displayName: true, year: true, versionNumber: true },
        },
      },
    });

    if (!inspection) {
      throw new AppError('Não foi possível registrar a conferência.', 500);
    }

    return toPublicInspection(inspection);
  }
}
