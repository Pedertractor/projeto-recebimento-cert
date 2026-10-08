import type { PrismaClient, QualityDocument, User } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import type { CreateQualityDocumentFields } from '../schemas/quality-document.schemas.js';
import {
  buildQualityDocumentDisplayName,
  saveQualityDocumentFile,
} from '../utils/quality-document-storage.js';

type QualityDocumentWithUser = QualityDocument & {
  uploadedBy: Pick<User, 'id' | 'name'>;
};

function toPublicQualityDocument(document: QualityDocumentWithUser) {
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

export class QualityDocumentService {
  constructor(private readonly prisma: PrismaClient) {}

  async list() {
    const documents = await this.prisma.qualityDocument.findMany({
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: [{ year: 'desc' }, { versionNumber: 'desc' }],
    });

    return documents.map(toPublicQualityDocument);
  }

  async create(
    userId: number,
    fields: CreateQualityDocumentFields,
    file: { buffer: Buffer; filename: string },
  ) {
    const year = fields.year;

    const document = await this.prisma.$transaction(async (tx) => {
      const latestForYear = await tx.qualityDocument.findFirst({
        where: { year },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      });

      const versionNumber = (latestForYear?.versionNumber ?? 0) + 1;
      const storagePath = await saveQualityDocumentFile(
        year,
        versionNumber,
        file.buffer,
        file.filename,
      );

      return tx.qualityDocument.create({
        data: {
          year,
          versionNumber,
          displayName: buildQualityDocumentDisplayName(year, versionNumber),
          fileName: file.filename,
          storagePath,
          uploadedByUserId: userId,
        },
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      });
    });

    return toPublicQualityDocument(document);
  }

  async findById(id: string) {
    const document = await this.prisma.qualityDocument.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    if (!document) {
      throw new AppError('Documento não encontrado.', 404);
    }

    return toPublicQualityDocument(document);
  }
}
