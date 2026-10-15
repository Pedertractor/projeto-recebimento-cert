import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import {
  createProductTypeController,
  listProductTypeOptionsController,
  listProductTypesController,
} from '../controllers/product-type.controller.js';
import {
  createProductTypeBodySchema,
  listProductTypesResponseSchema,
  productTypeSchema,
} from '../schemas/product-type.schemas.js';
import type { CreateProductTypeBody } from '../schemas/product-type.schemas.js';
import { commonErrors } from '../schemas/error.schemas.js';

export function productTypeRoutes(fastify: FastifyInstance) {
  fastify.get(
    '',
    {
      schema: {
        summary: 'List active product types',
        tags: ['ProductType'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listProductTypesResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.SUPERADMIN, UserRole.STOCK_LEADER),
      ],
    },
    listProductTypesController,
  );

  fastify.post<{ Body: CreateProductTypeBody }>(
    '',
    {
      schema: {
        summary: 'Create product type',
        tags: ['ProductType'],
        security: [{ cookieAuth: [] }],
        body: createProductTypeBodySchema,
        response: {
          201: productTypeSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.SUPERADMIN, UserRole.STOCK_LEADER),
        fastify.csrfProtection,
      ],
    },
    createProductTypeController,
  );

  fastify.get(
    '/options',
    {
      schema: {
        summary: 'List active product types for forms',
        tags: ['ProductType'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listProductTypesResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(
          UserRole.SUPERADMIN,
          UserRole.STOCK_LEADER,
          UserRole.STOCK_OPERATOR,
          UserRole.PURCHASE_OPERATOR,
          UserRole.QUALITY_VIEWER,
        ),
      ],
    },
    listProductTypeOptionsController,
  );
}
