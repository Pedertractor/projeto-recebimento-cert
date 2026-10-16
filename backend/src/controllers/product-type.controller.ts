import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';
import { createProductTypeBodySchema } from '../schemas/product-type.schemas.js';
import type { CreateProductTypeBody } from '../schemas/product-type.schemas.js';
import { ProductTypeService } from '../services/product-type.service.js';

export async function listProductTypesController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new ProductTypeService(req.server.prisma);
  const productTypes = await service.listAll();
  return reply.send(productTypes);
}

export async function listProductTypeOptionsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new ProductTypeService(req.server.prisma);
  const productTypes = await service.listActive();
  return reply.send(productTypes);
}

export async function createProductTypeController(
  req: FastifyRequest<{ Body: CreateProductTypeBody }>,
  reply: FastifyReply,
) {
  const parsed = createProductTypeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  }

  const service = new ProductTypeService(req.server.prisma);
  const productType = await service.create(parsed.data);
  return reply.status(201).send(productType);
}
