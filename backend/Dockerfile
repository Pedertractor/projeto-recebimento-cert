FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm set strict-ssl false
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm install

# prisma.config.ts exige DATABASE_URL ao carregar; .env não entra no build (.dockerignore)
ENV DATABASE_URL=postgresql://certificado_qualidade:certificado_qualidade@compara-nf-database:5432/certificado_qualidade

COPY . .

RUN npx prisma generate && npm run build

FROM node:22-alpine

WORKDIR /usr/src/app

RUN npm set strict-ssl false
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p uploads/certificate-requests uploads/suppliers uploads/quality-documents

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run seed && npm run start"]
