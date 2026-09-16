import type { FastifyReply, FastifyRequest } from 'fastify';
import { SupplierService } from '../services/supplier.service.js';
import type {
  CreateSupplierBody,
  ListSuppliersQuery,
} from '../schemas/supplier.schemas.js';

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
  const supplier = await service.create(req.body);
  return reply.status(201).send(supplier);
}
