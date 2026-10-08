import type { FastifyInstance } from 'fastify';
import { csrfRoutes } from './csrf.routes.js';
import { certificateRequestRoutes } from './certificate-request.routes.js';
import { qualityDocumentRoutes } from './quality-document.routes.js';
import { supplierRoutes } from './supplier.routes.js';
import { userRoutes } from './user.routes.js';

export default function mainRoutes(fastify: FastifyInstance) {
  fastify.register(csrfRoutes);
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(supplierRoutes, { prefix: '/suppliers' });
  fastify.register(certificateRequestRoutes, {
    prefix: '/certificate-requests',
  });
  fastify.register(qualityDocumentRoutes, {
    prefix: '/quality-documents',
  });
}
