# Documentação — Solicitação de Certificado de Qualidade

Documentação funcional e de domínio do sistema de solicitação de certificados de qualidade para chapas recebidas via nota fiscal.

## Índice

| Documento | Conteúdo |
| --------- | -------- |
| [Visão geral](./visao-geral.md) | Problema, objetivo e escopo do sistema |
| [Usuários e papéis](./usuarios-e-papeis.md) | Operador de estoque, operador de compras e interações |
| [Conceitos do domínio](./conceitos-do-dominio.md) | Glossário: NF, lote, certificado, fornecedor, etc. |
| [Regras de negócio](./regras-de-negocio.md) | Regras explícitas, incluindo relação NF ↔ lotes ↔ certificados |
| [Fluxo da solicitação](./fluxo-da-solicitacao.md) | Fluxo ponta a ponta com diagramas |
| [Funcionalidades por módulo](./funcionalidades-por-modulo.md) | Telas, abas e ações de cada papel |
| [Notificações e e-mails](./notificacoes-e-emails.md) | E-mails, magic link e eventos de notificação |
| [Estados e ciclo de vida](./estados-e-ciclo-de-vida.md) | Status da solicitação e transições permitidas |
| [Modelo conceitual](./modelo-conceitual.md) | Entidades, relacionamentos e anexos |

## Status

Documentação em **fase inicial** — descreve requisitos funcionais antes da implementação de código.

## Convenções

- **NF** = Nota Fiscal
- **Certificado** = documento de qualidade do lote de chapa (detalhes técnicos conforme padrão interno da fábrica)
- Termos do domínio industrial são usados de forma consistente em todo o projeto
