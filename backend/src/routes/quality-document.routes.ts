import type { FastifyInstance } from 'fastify';
import { UserRole } from '../generated/prisma/enums.js';
import { getCurrentQualityDocumentController } from '../controllers/certificate-inspection.controller.js';
import {
  createQualityDocumentController,
  listQualityDocumentsController,
} from '../controllers/quality-document.controller.js';
import {
  listQualityDocumentsResponseSchema,
  qualityDocumentResponseSchema,
} from '../schemas/quality-document.schemas.js';
import { commonErrors } from '../schemas/error.schemas.js';

export function qualityDocumentRoutes(fastify: FastifyInstance) {
  fastify.get(
    '',
    {
      schema: {
        summary: 'List quality document versions',
        tags: ['QualityDocument'],
        security: [{ cookieAuth: [] }],
        response: {
          200: listQualityDocumentsResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    listQualityDocumentsController,
  );

  fastify.get(
    '/current',
    {
      schema: {
        summary: 'Get current quality document version',
        tags: ['QualityDocument'],
        security: [{ cookieAuth: [] }],
        response: {
          200: qualityDocumentResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
      ],
    },
    getCurrentQualityDocumentController,
  );

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create new quality document version',
        tags: ['QualityDocument'],
        security: [{ cookieAuth: [] }],
        consumes: ['multipart/form-data'],
        response: {
          201: qualityDocumentResponseSchema,
          ...commonErrors,
        },
      },
      onRequest: [
        fastify.authenticate,
        fastify.authorize(UserRole.STOCK_OPERATOR),
        fastify.csrfProtection,
      ],
    },
    createQualityDocumentController,
  );
}
