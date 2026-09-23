import type { FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';
import {
  createSupplierBodySchema,
  type CreateSupplierBody,
} from '../schemas/supplier.schemas.js';

export type SupplierMultipartPayload = {
  body: CreateSupplierBody;
  logoFile: { buffer: Buffer; filename: string } | null;
  removeLogo: boolean;
};

export async function parseSupplierMultipartRequest(
  request: FastifyRequest,
): Promise<SupplierMultipartPayload> {
  const fields: Record<string, string> = {};
  let logoFile: { buffer: Buffer; filename: string } | null = null;

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (part.fieldname === 'logoFile' && !logoFile) {
        const buffer = await part.toBuffer();
        logoFile = {
          buffer,
          filename: part.filename || 'logo.png',
        };
      }
      continue;
    }

    fields[part.fieldname] = String(part.value ?? '');
  }

  const parsed = createSupplierBodySchema.safeParse(fields);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  return {
    body: parsed.data,
    logoFile,
    removeLogo: fields.removeLogo === 'true' || fields.removeLogo === '1',
  };
}

export function isMultipartSupplierRequest(request: FastifyRequest): boolean {
  const contentType = request.headers['content-type'] ?? '';
  return contentType.includes('multipart/form-data');
}
