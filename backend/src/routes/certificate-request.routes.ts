import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import {
  createCertificateRequestController,
  getCertificateRequestController,
  listCertificateRequestsController,
  listRecentCertificateRequestsController,
} from '../controllers/certificate-request.controller.js';
import {
  certificateRequestIdParamsSchema,
  certificateRequestResponseSchema,
  listCertificateRequestsResponseSchema,
  type CertificateRequestIdParams,
} from '../schemas/certificate-request.schemas.js';
import { commonErrors } from '../schemas/error.schemas.js';

export function certificateRequestRoutes(fastify: FastifyInstance) {
  fastify.get(
    '',
    {
      schema: {
        summary: 'List certificate requests for current stock operator',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listCertificateRequestsResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    listCertificateRequestsController,
  );

  fastify.get(
    '/recent',
    {
      schema: {
        summary: 'List recent certificate requests',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listCertificateRequestsResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    listRecentCertificateRequestsController,
  );

  fastify.get<{ Params: CertificateRequestIdParams }>(
    '/:id',
    {
      schema: {
        summary: 'Get certificate request by id',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        params: certificateRequestIdParamsSchema,
        response: {
          200: certificateRequestResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    getCertificateRequestController,
  );

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create certificate request with invoice attachment',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        consumes: ['multipart/form-data'],
        response: {
          201: certificateRequestResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    createCertificateRequestController,
  );
}
