import type { FastifyReply, FastifyRequest } from 'fastify';
import { SupplierService } from '../services/supplier.service.js';
import type {
  CreateSupplierBody,
  ListSuppliersQuery,
  SupplierIdParams,
  UpdateSupplierBody,
} from '../schemas/supplier.schemas.js';
import {
  isMultipartSupplierRequest,
  parseSupplierMultipartRequest,
} from '../utils/supplier-multipart.js';

export async function listSuppliersController(
  req: FastifyRequest<{ Querystring: ListSuppliersQuery }>,
  reply: FastifyReply,
) {
  const service = new SupplierService(req.server.prisma);
  const suppliers = await service.list(req.query.search);
  return reply.send(suppliers);
}

export async function createSupplierController(
  req: FastifyRequest<{ Body: CreateSupplierBody }>,
  reply: FastifyReply,
) {
  const service = new SupplierService(req.server.prisma);

  if (isMultipartSupplierRequest(req)) {
    const { body, logoFile } = await parseSupplierMultipartRequest(req);
    const supplier = await service.create(body, logoFile);
    return reply.status(201).send(supplier);
  }

  const supplier = await service.create(req.body);
  return reply.status(201).send(supplier);
}

export async function updateSupplierController(
  req: FastifyRequest<{ Params: SupplierIdParams; Body: UpdateSupplierBody }>,
  reply: FastifyReply,
) {
  const service = new SupplierService(req.server.prisma);

  if (isMultipartSupplierRequest(req)) {
    const { body, logoFile, removeLogo } =
      await parseSupplierMultipartRequest(req);
    const supplier = await service.update(req.params.id, body, {
      logoFile,
      removeLogo,
    });
    return reply.send(supplier);
  }

  const supplier = await service.update(req.params.id, req.body);
  return reply.send(supplier);
}
