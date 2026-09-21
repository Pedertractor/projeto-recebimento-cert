import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import type { PublicQualityDocument } from '../schemas/quality-document.schemas.js';

type QualityDocumentWithUploader = Prisma.QualityDocumentGetPayload<{
  include: {
    uploadedBy: { select: { id: true; name: true } };
  };
}>;

export function toPublicQualityDocument(
  document: QualityDocumentWithUploader,
): PublicQualityDocument {
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

export async function getCurrentQualityDocumentRecord(
  prisma: PrismaClient,
): Promise<QualityDocumentWithUploader> {
  const document = await prisma.qualityDocument.findFirst({
    orderBy: [{ year: 'desc' }, { versionNumber: 'desc' }],
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  if (!document) {
    throw new AppError('Nenhum documento de qualidade cadastrado.', 404);
  }

  return document;
}

export async function resolveQualityDocumentForRequest(
  prisma: PrismaClient,
  request: {
    qualityDocumentId: string | null;
    qualityDocument: QualityDocumentWithUploader | null;
  },
): Promise<PublicQualityDocument> {
  if (request.qualityDocumentId && request.qualityDocument) {
    return toPublicQualityDocument(request.qualityDocument);
  }

  const current = await getCurrentQualityDocumentRecord(prisma);
  return toPublicQualityDocument(current);
}
