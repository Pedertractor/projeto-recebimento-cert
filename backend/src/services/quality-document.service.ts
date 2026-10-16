import type { PrismaClient } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import type { CreateQualityDocumentFields } from '../schemas/quality-document.schemas.js';
import { ProductTypeService } from './product-type.service.js';
import {
  buildQualityDocumentDisplayName,
  saveQualityDocumentFile,
} from '../utils/quality-document-storage.js';
import { toPublicQualityDocument } from '../utils/quality-document-public.js';

export class QualityDocumentService {
  constructor(private readonly prisma: PrismaClient) {}

  async list() {
    const documents = await this.prisma.qualityDocument.findMany({
      include: {
        uploadedBy: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
      },
      orderBy: [
        { productType: { name: 'asc' } },
        { year: 'desc' },
        { versionNumber: 'desc' },
      ],
    });

    return documents.map(toPublicQualityDocument);
  }

  async create(
    userId: number,
    fields: CreateQualityDocumentFields,
    file: { buffer: Buffer; filename: string },
  ) {
    const productTypeService = new ProductTypeService(this.prisma);
    await productTypeService.findActiveById(fields.productTypeId);

    const year = fields.year;
    const productTypeId = fields.productTypeId;

    const document = await this.prisma.$transaction(async (tx) => {
      const latestForYear = await tx.qualityDocument.findFirst({
        where: { year, productTypeId },
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
          productTypeId,
          year,
          versionNumber,
          displayName: buildQualityDocumentDisplayName(year, versionNumber),
          fileName: file.filename,
          storagePath,
          uploadedByUserId: userId,
        },
        include: {
          uploadedBy: { select: { id: true, name: true } },
          productType: { select: { id: true, name: true } },
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
        productType: { select: { id: true, name: true } },
      },
    });

    if (!document) {
      throw new AppError('Documento não encontrado.', 404);
    }

    return toPublicQualityDocument(document);
  }
}
