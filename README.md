# Solicitação de Certificado de Qualidade

Sistema para rastrear solicitações de **certificados de qualidade** faltantes em notas fiscais de chapas.

Monorepo com frontend e backend separados, seguindo a mesma stack do projeto Batalha Naval.

## Stack

| Camada   | Tecnologias                                    |
| -------- | ---------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind 4, shadcn |
| Backend  | Fastify 5, TypeScript, Prisma 7, PostgreSQL  |
| Auth     | JWT em cookie, CSRF, refresh token             |

## Roles

| Role | Descrição |
| ---- | --------- |
| `SUPERADMIN` | Gestão de usuários (criar, listar, alterar perfil, reset senha) |
| `STOCK_OPERATOR` | Operador de estoque |
| `PURCHASE_OPERATOR` | Operador de compras |

## Desenvolvimento

### Banco de dados (Docker)

```bash
cd backend
cp .env.example .env
docker compose up -d
```

Postgres na porta **5434** por padrão.

### Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run seed:dev
npm run dev
```

API em `http://127.0.0.1:9091` (porta padrão deste projeto).

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Documentação funcional

Ver [`docs/README.md`](./docs/README.md).

## Primeiro acesso

Usuários seed com perfil `SUPERADMIN` usam o **número do cartão** como senha inicial e devem trocá-la no primeiro login.
