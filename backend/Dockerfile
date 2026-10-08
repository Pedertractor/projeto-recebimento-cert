FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm set strict-ssl false
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm ci 

COPY . .

# Prisma 7 carrega prisma.config.ts no generate e exige DATABASE_URL (não usa o banco neste passo).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

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

CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run start"]
