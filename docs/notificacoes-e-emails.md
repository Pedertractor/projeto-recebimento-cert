# Notificações e e-mails

## Visão geral

O sistema utiliza **e-mail** como canal principal de notificação entre estoque e compras. O compras acessa a solicitação por **magic link** embutido no e-mail.

---

## E-mail 1 — Nova solicitação (estoque → compras)

**Gatilho:** operador de estoque clica em **Enviar solicitação**.

**Destinatário:** endereço configurado do operador de compras (ou lista — ver Q-06).

**Assunto (sugestão):**

```
[Solicitação Certificado] NF {data} — {nome fornecedor}
```

**Corpo (estrutura):**

| Bloco | Conteúdo |
| ----- | -------- |
| Saudação | Identificação do remetente (sistema / estoque) |
| Resumo | Fornecedor, CNPJ, data da NF, quantidade de certificados faltantes |
| Observações | Texto livre do estoque (se houver) |
| Call to action | Botão/link **Abrir solicitação** (magic link) |
| Rodapé | ID da solicitação, data/hora de abertura |

**Magic link:**

```
https://{dominio}/solicitacoes/{solicitacaoId}?token={token}
```

- `token`: valor opaco, único, validado no backend
- Link deve abrir diretamente a tela de detalhe da solicitação (visão compras)

---

## E-mail 2 — Solicitação concluída (compras → estoque)

**Gatilho:** compras clica em **Concluir solicitação** com todos os certificados anexados.

**Destinatário:** e-mail do operador de estoque que abriu a solicitação (ou equipe de estoque — a definir).

**Assunto (sugestão):**

```
[Certificados recebidos] Solicitação #{id} — {nome fornecedor}
```

**Corpo (estrutura):**

| Bloco | Conteúdo |
| ----- | -------- |
| Resumo | Fornecedor, data NF, quantidade de certificados anexados |
| Call to action | Link para visualizar/baixar certificados no sistema |
| Rodapé | Data de conclusão |

---

## E-mails fora do sistema

| De | Para | Assunto |
| -- | ---- | ------- |
| Compras | Fornecedor | Cobrança de certificados da NF — **não enviado pelo sistema** |

O sistema apenas **registra** que o compras fez esse contato (data/hora), não envia e-mail ao fornecedor na v1.

---

## Requisitos do magic link

| Requisito | Descrição |
| --------- | --------- |
| Unicidade | Um token por solicitação (ou por solicitação + destinatário) |
| Segurança | Token não previsível; validação server-side |
| Escopo | Acesso somente à solicitação vinculada |
| Expiração | A definir (ex.: 30 dias ou até conclusão) |
| Revogação | Novo token se solicitação for reaberta (fase futura) |

---

## Eventos futuros (opcional)

| Evento | Destinatário | Prioridade |
| ------ | ------------ | ---------- |
| Lembrete: compras não registrou envio ao fornecedor em X dias | Compras | Baixa |
| Certificados parciais anexados | Estoque | Baixa |
| Solicitação cancelada | Compras | Média |

---

## Configuração (implementação)

Variáveis de ambiente sugeridas:

| Variável | Descrição |
| -------- | --------- |
| `CORREIO` | Host SMTP (ex.: correio.ptractor.com.br) |
| `EMAIL_AUTOMACAO` | Usuário/remetente SMTP |
| `PASSWORD_AUTOMACAO` | Senha SMTP |
| `PORT_CORREIO` | Porta SMTP (padrão: 587) |
| `EMAIL_COMPRAS` | Destinatário fallback se nenhum operador de compras tiver e-mail |
| `APP_BASE_URL` | Base URL para montar magic links |
