# Regras de negócio

## RN-01 — Relação NF, lotes e certificados

- Uma **NF pode conter vários lotes** de chapas.
- **Cada lote exige um certificado de qualidade** distinto.
- Ao concluir uma solicitação, o compras deve ter anexado **todos os certificados faltantes** referentes aos lotes daquela NF (quantidade definida na abertura ou complementada durante o fluxo — ver RN-04).

## RN-02 — Motivo de abertura da solicitação

- A solicitação só deve ser aberta quando o operador de estoque identificar que a NF recebida **não acompanha** os certificados necessários para conferência.
- O anexo da **NF é obrigatório** na abertura.

## RN-03 — Fornecedor obrigatório e pré-cadastrado

- Toda solicitação deve estar vinculada a um **fornecedor cadastrado**.
- O fornecedor deve existir na base antes da abertura (cadastro feito pelo operador de estoque em aba dedicada).

## RN-04 — Quantidade de certificados esperados

Na abertura da solicitação, o operador de estoque deve informar **quantos certificados estão faltando** (correspondente ao número de lotes sem certificado na NF).

> **Decisão de design:** na v1, um campo numérico ou lista simples de lotes identificados (ex.: "Lote 1", "Lote 2") pode ser usado. Detalhamento de itens da NF via integração ERP fica fora do escopo inicial.

## RN-05 — Data da NF

- A **data da nota fiscal** é informada pelo operador de estoque na abertura.
- Serve como referência para compras e fornecedor localizarem a NF correta.

## RN-06 — Notificação ao compras

- Ao enviar a solicitação, o sistema dispara **e-mail automático** ao operador de compras.
- O e-mail contém dados resumidos (fornecedor, data da NF) e um **magic link** para a solicitação.

## RN-07 — Registro de contato com fornecedor

- O compras deve registrar **quando** solicitou os certificados ao fornecedor (data/hora).
- Essa ação é obrigatória **antes** de anexar certificados (ordem lógica do fluxo).

## RN-08 — Anexo de certificados pelo compras

- Certificados são anexados pelo compras, **não** pelo estoque na abertura.
- Cada anexo deve poder ser identificado (nome do arquivo ou rótulo de lote).
- O número de certificados anexados deve atingir a **quantidade esperada** antes da conclusão.

## RN-09 — Conclusão da solicitação

- Somente o compras pode **concluir** a solicitação.
- Conclusão exige: contato com fornecedor registrado + todos os certificados esperados anexados.
- Após conclusão, o operador de estoque é **notificado** (e-mail ou indicador no sistema).

## RN-10 — Rastreabilidade

- Toda transição de status e anexo deve registrar **quem** e **quando** (auditoria básica).

## RN-11 — Magic link

- O magic link dá acesso à solicitação específica sem exigir navegação manual.
- Deve ser **único por solicitação** e considerar expiração ou revogação na implementação (detalhe técnico a definir).

## RN-12 — Fornecedor único por solicitação

- Uma solicitação refere-se a **uma NF de um fornecedor**.
- NFs de fornecedores diferentes geram solicitações separadas.

## Regras em aberto (confirmar com negócio)

| # | Questão |
| - | ------- |
| Q-01 | O operador de estoque informa o **número da NF** além da data? |
| Q-02 | Existe **prazo SLA** para o compras responder ao fornecedor ou concluir? |
| Q-03 | Solicitação pode ser **cancelada** pelo estoque se a NF foi devolvida? |
| Q-04 | Compras pode **rejeitar** solicitação (ex.: NF incorreta)? |
| Q-05 | Formatos aceitos para anexos (PDF apenas? tamanho máximo)? |
| Q-06 | Um único e-mail fixo de compras ou lista de destinatários? |
