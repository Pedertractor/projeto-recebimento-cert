# Funcionalidades por módulo

Organização sugerida da interface por **abas** ou **módulos**, separando responsabilidades do operador de estoque e do operador de compras.

---

## Módulo: Fornecedores (Operador de estoque)

**Objetivo:** manter cadastro de fornecedores de chapas para uso nas solicitações.

### Tela: Listagem de fornecedores

| Elemento | Descrição |
| -------- | --------- |
| Tabela | Nome, CNPJ, descrição (resumida), ações |
| Ação | Botão **Novo fornecedor** |
| Busca | Filtro por nome ou CNPJ (desejável) |

### Tela: Cadastro / edição de fornecedor

| Campo | Tipo | Obrigatório |
| ----- | ---- | :-----------: |
| Nome | Texto | Sim |
| CNPJ | Texto (máscara) | Sim |
| Descrição | Textarea | Não |

**Validações:**

- CNPJ único na base
- CNPJ com formato válido

---

## Módulo: Solicitar certificado (Operador de estoque)

**Objetivo:** abrir solicitação quando NF chega sem certificados.

### Tela: Nova solicitação

| Campo | Tipo | Obrigatório |
| ----- | ---- | :-----------: |
| Fornecedor | Combobox (fornecedores cadastrados) | Sim |
| Data da nota fiscal | Date picker | Sim |
| Quantidade de certificados faltantes | Número (≥ 1) | Sim |
| Anexo da NF | Upload de arquivo | Sim |
| Observações | Textarea | Não |

**Ações:**

- **Enviar solicitação** — valida campos, persiste, envia e-mail ao compras
- **Cancelar** — descarta rascunho (se houver)

### Tela: Minhas solicitações (estoque)

| Elemento | Descrição |
| -------- | --------- |
| Listagem | Solicitações com status, fornecedor, data NF, data abertura |
| Filtros | Status, fornecedor, período |
| Detalhe | Ao clicar: histórico, anexos, certificados (quando concluída) |

---

## Módulo: Solicitação — visão compras

**Objetivo:** permitir que o compras trate a solicitação recebida via magic link.

**Acesso:** URL com token (`/solicitacoes/{id}?token=...`) ou rota equivalente.

### Tela: Detalhe da solicitação (compras)

**Seção: Dados da solicitação**

| Informação | Origem |
| ---------- | ------ |
| Fornecedor | Abertura estoque |
| CNPJ | Cadastro fornecedor |
| Data da NF | Abertura estoque |
| Certificados esperados | Abertura estoque |
| Observações | Abertura estoque |
| NF anexada | Download/visualização |

**Seção: Ações do compras**

| Ação | Quando disponível | Efeito |
| ---- | ----------------- | ------ |
| Registrar envio ao fornecedor | Status *Aguardando compras* | Grava timestamp; status → *Aguardando fornecedor* |
| Anexar certificado | Após registro de envio | Adiciona arquivo à solicitação |
| Remover certificado | Antes de concluir | Remove anexo incorreto |
| Concluir solicitação | Todos certificados anexados | Status → *Concluída*; notifica estoque |

**Seção: Certificados anexados**

| Coluna | Descrição |
| ------ | --------- |
| Nome / rótulo | Identificação do lote ou arquivo |
| Data upload | Quando compras anexou |
| Ação | Download |

**Indicador de progresso:** `X de Y certificados anexados`

---

## Módulo: Notificações (transversal)

- Disparo de e-mail na abertura (estoque → compras)
- Disparo de e-mail na conclusão (compras → estoque)

Detalhes em [Notificações e e-mails](./notificacoes-e-emails.md).

---

## Wireframe textual — Navegação estoque

```
┌─────────────────────────────────────────────────┐
│  Solicitação de Certificado de Qualidade        │
├─────────────────────────────────────────────────┤
│  [ Fornecedores ]  [ Solicitar certificado ]    │
│                    [ Minhas solicitações ]      │
├─────────────────────────────────────────────────┤
│                                                 │
│              (conteúdo da aba ativa)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Wireframe textual — Tela compras (via magic link)

```
┌─────────────────────────────────────────────────┐
│  Solicitação #123 — Aguardando fornecedor       │
├─────────────────────────────────────────────────┤
│  Fornecedor: ACME Chapas Ltda                   │
│  CNPJ: 00.000.000/0001-00                       │
│  Data NF: 15/09/2026                            │
│  Certificados esperados: 3                      │
│  NF: [ Baixar nota_fiscal.pdf ]                 │
├─────────────────────────────────────────────────┤
│  [ Registrar envio ao fornecedor ]  (feito em…) │
├─────────────────────────────────────────────────┤
│  Certificados (1/3)                             │
│  [ + Anexar certificado ]                         │
│  • cert_lote_a.pdf                              │
├─────────────────────────────────────────────────┤
│  [ Concluir solicitação ]  (desabilitado)       │
└─────────────────────────────────────────────────┘
```
