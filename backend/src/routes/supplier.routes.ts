import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import {
  createSupplierController,
  listSuppliersController,
  updateSupplierController,
} from '../controllers/supplier.controller.js';
import {
  createSupplierResponseSchema,
  listSuppliersQuerySchema,
  listSuppliersResponseSchema,
  supplierIdParamsSchema,
  type CreateSupplierBody,
  type ListSuppliersQuery,
  type SupplierIdParams,
  type UpdateSupplierBody,
} from '../schemas/supplier.schemas.js';
import { commonErrors } from '../schemas/error.schemas.js';

export function supplierRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ListSuppliersQuery }>(
    '',
    {
      schema: {
        summary: 'List suppliers',
        tags: ['Supplier'],
        security: [{ cookieAuth: [] }],
        querystring: listSuppliersQuerySchema,
        response: {
          200: listSuppliersResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    listSuppliersController,
  );

  fastify.post<{ Body: CreateSupplierBody }>(
    '',
    {
      schema: {
        summary: 'Create supplier',
        tags: ['Supplier'],
        security: [{ cookieAuth: [] }],
        consumes: ['application/json', 'multipart/form-data'],
        response: {
          201: createSupplierResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    createSupplierController,
  );

  fastify.patch<{ Params: SupplierIdParams; Body: UpdateSupplierBody }>(
    '/:id',
    {
      schema: {
        summary: 'Update supplier',
        tags: ['Supplier'],
        security: [{ cookieAuth: [] }],
        consumes: ['application/json', 'multipart/form-data'],
        params: supplierIdParamsSchema,
        response: {
          200: createSupplierResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    updateSupplierController,
  );
}
