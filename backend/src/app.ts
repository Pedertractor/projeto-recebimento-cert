import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import csrfProtection from '@fastify/csrf-protection';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import prismaPlugin from './plugins/prisma.js';
import { authPlugin } from './plugins/auth.js';
import mainRoutes from './routes/main.routes.js';
import { errorHandler } from './lib/errorHandler.js';
import { env } from './config/env.js';

const app = Fastify({
  logger: true,
  bodyLimit: 15 * 1024 * 1024,
}).withTypeProvider<ZodTypeProvider>();

app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(cookie, {
  secret: env.COOKIE_SECRET,
});

app.register(csrfProtection, {
  cookieKey: '_csrf',
  cookieOpts: {
    signed: true,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: env.cookieSecure,
  },
});

app.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 6,
  },
});

app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Certificado de Qualidade API',
      description: 'API de solicitação de certificados de qualidade',
      version: '0.1.0',
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.setErrorHandler(errorHandler);

app.register(prismaPlugin);
app.register(authPlugin);

app.get('/health', async () => {
  return { status: 'ok' };
});

app.register(mainRoutes, { prefix: '/api' });

export { app };
