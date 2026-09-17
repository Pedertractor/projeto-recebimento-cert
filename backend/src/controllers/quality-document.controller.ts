import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';
import { createQualityDocumentFieldsSchema } from '../schemas/quality-document.schemas.js';
import { QualityDocumentService } from '../services/quality-document.service.js';

type MultipartFields = Record<string, string>;

async function parseMultipartRequest(
  request: FastifyRequest,
): Promise<{ fields: MultipartFields; file: { buffer: Buffer; filename: string } | null }> {
  const fields: MultipartFields = {};
  let file: { buffer: Buffer; filename: string } | null = null;

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (part.fieldname === 'documentFile' && !file) {
        const buffer = await part.toBuffer();
        file = {
          buffer,
          filename: part.filename || 'doc-qualidade.pdf',
        };
      }
      continue;
    }

    fields[part.fieldname] = String(part.value ?? '');
  }

  return { fields, file };
}

export async function listQualityDocumentsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new QualityDocumentService(req.server.prisma);
  const documents = await service.list();
  return reply.send(documents);
}

export async function createQualityDocumentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { fields, file } = await parseMultipartRequest(req);

  if (!file) {
    throw new AppError('Anexe o documento de qualidade.');
  }

  const parsed = createQualityDocumentFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const service = new QualityDocumentService(req.server.prisma);
  const document = await service.create(req.user.id, parsed.data, file);
  return reply.status(201).send(document);
}
