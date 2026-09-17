import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import {
  attachCertificateController,
  cancelCertificateRequestController,
  completeCertificateRequestController,
  createCertificateRequestController,
  getCertificateRequestController,
  listCertificateRequestsController,
  listPendingPurchaseCertificateRequestsController,
  listPurchaseCertificateRequestsController,
  listRecentCertificateRequestsController,
  registerSupplierContactController,
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
    '/purchase',
    {
      schema: {
        summary: 'List certificate requests for purchase operator',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listCertificateRequestsResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.PURCHASE_OPERATOR),
      ],
    },
    listPurchaseCertificateRequestsController,
  );

  fastify.get(
    '/purchase/pending',
    {
      schema: {
        summary: 'List pending certificate requests for purchase operator',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listCertificateRequestsResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.PURCHASE_OPERATOR),
      ],
    },
    listPendingPurchaseCertificateRequestsController,
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
      onRequest: [fastify.authenticate],
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

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/supplier-contact',
    {
      schema: {
        summary: 'Register supplier contact for certificate request',
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
        fastify.authorize(UserRole.PURCHASE_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    registerSupplierContactController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/certificates',
    {
      schema: {
        summary: 'Attach certificate to certificate request',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        consumes: ['multipart/form-data'],
        params: certificateRequestIdParamsSchema,
        response: {
          200: certificateRequestResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.PURCHASE_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    attachCertificateController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/complete',
    {
      schema: {
        summary: 'Complete certificate request',
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
        fastify.authorize(UserRole.PURCHASE_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    completeCertificateRequestController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/cancel',
    {
      schema: {
        summary: 'Cancel certificate request by stock operator',
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
        fastify.csrfProtection,
      ],
    },
    cancelCertificateRequestController,
  );
}
