import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import {
  attachConferencePrintController,
  attachConferencePrintPasteController,
  listCompletedCertificateRequestsController,
  submitCertificateInspectionController,
} from '../controllers/certificate-inspection.controller.js';
import {
  attachCertificateController,
  cancelCertificateRequestController,
  completeCertificateRequestController,
  createCertificateRequestController,
  getCertificateRequestController,
  linkCertificatePdfController,
  listCertificateRequestsController,
  listPendingPurchaseCertificateRequestsController,
  listPurchaseCertificateRequestsController,
  listRecentCertificateRequestsController,
  registerSupplierContactController,
  requestDocumentFromPurchaseController,
  updateCertificateRequestController,
  upsertInvoiceController,
} from '../controllers/certificate-request.controller.js';
import {
  attachConferencePrintPasteSchema,
  certificateInspectionParamsSchema,
  certificateInspectionSchema,
  submitCertificateInspectionSchema,
} from '../schemas/certificate-inspection.schemas.js';
import {
  certificateRequestIdParamsSchema,
  certificateRequestResponseSchema,
  listCertificateRequestsResponseSchema,
  updateCertificateRequestSchema,
  type CertificateRequestIdParams,
  type UpdateCertificateRequestFields,
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
    '/completed',
    {
      schema: {
        summary: 'List completed certificate requests for conference',
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
    listCompletedCertificateRequestsController,
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

  fastify.patch<{
    Params: CertificateRequestIdParams;
    Body: UpdateCertificateRequestFields;
  }>(
    '/:id',
    {
      schema: {
        summary: 'Update certificate request invoice data',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        params: certificateRequestIdParamsSchema,
        body: updateCertificateRequestSchema,
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
    updateCertificateRequestController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/invoice',
    {
      schema: {
        summary: 'Attach or replace invoice file for stock operator',
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
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    upsertInvoiceController,
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
        summary: 'Attach combined invoice and certificates PDF',
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
    '/:id/request-document',
    {
      schema: {
        summary: 'Request certificate PDF from purchase operator',
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
    requestDocumentFromPurchaseController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/link-certificate',
    {
      schema: {
        summary: 'Link combined invoice and certificates PDF from stock',
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
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    linkCertificatePdfController,
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
    '/:id/conference-prints/paste',
    {
      schema: {
        summary: 'Attach conference print from pasted image',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        params: certificateRequestIdParamsSchema,
        body: attachConferencePrintPasteSchema,
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
    attachConferencePrintPasteController,
  );

  fastify.post<{ Params: CertificateRequestIdParams }>(
    '/:id/conference-prints',
    {
      schema: {
        summary: 'Attach conference print for a lot',
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
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    attachConferencePrintController,
  );

  fastify.post<{ Params: CertificateRequestIdParams & { attachmentId: string } }>(
    '/:id/attachments/:attachmentId/inspection',
    {
      schema: {
        summary: 'Submit certificate inspection comparison',
        tags: ['CertificateRequest'],
        security: [{ cookieAuth: [] }],
        params: certificateInspectionParamsSchema,
        body: submitCertificateInspectionSchema,
        response: {
          201: certificateInspectionSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    submitCertificateInspectionController,
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
