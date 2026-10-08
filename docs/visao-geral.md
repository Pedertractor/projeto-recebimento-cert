# Visão geral

## Contexto

Em uma metalúrgica, o recebimento de **chapas** de fornecedores ocorre mediante **nota fiscal (NF)**. Cada NF pode conter **vários lotes** de chapas. Para cada lote, o fornecedor deve enviar o **certificado de qualidade** com os detalhes técnicos da chapa, permitindo que o operador de estoque faça a **conferência** contra os **padrões internos de qualidade** da fábrica (documentação da qualidade).

Na prática, alguns fornecedores **esquecem de enviar** os certificados junto com a NF ou com os lotes. Quando isso acontece, o operador de estoque não consegue concluir a conferência e precisa acionar o **operador de compras**, que por sua vez solicita os documentos ao **fornecedor**.

Hoje esse fluxo tende a ser informal (e-mail, telefone, planilhas), sem rastreabilidade clara de quem pediu, quando pediu e se o certificado já foi recebido.

## Objetivo do sistema

Centralizar e rastrear a **solicitação de certificados de qualidade** faltantes em uma NF, conectando:

1. **Operador de estoque** — identifica a NF sem certificados e abre a solicitação
2. **Operador de compras** — recebe notificação, contata o fornecedor e devolve os certificados ao estoque
3. **Fornecedor** — (fora do sistema) envia os documentos ao compras por canal habitual

O sistema **não substitui** a conferência técnica nem o cadastro completo de qualidade; ele **orquestra a solicitação e o retorno** dos certificados faltantes.

## Escopo inicial

### Dentro do escopo

- Cadastro de fornecedores (nome, CNPJ, descrição)
- Abertura de solicitação de certificado vinculada a fornecedor, data da NF e anexo da NF
- Notificação por e-mail ao compras com **magic link** para a solicitação
- Acompanhamento pelo compras: registro de envio ao fornecedor e anexo dos certificados recebidos
- Retorno dos certificados ao operador de estoque (via sistema)
- Suporte à regra: **uma NF → vários lotes → um certificado por lote**

### Fora do escopo (por enquanto)

- Login/autenticação completa de usuários (a definir na implementação)
- Portal do fornecedor
- Conferência automática certificado × padrão interno
- Integração com ERP ou sistema fiscal
- Cadastro detalhado de itens/lotes da NF (pode ser fase futura)

## Resultado esperado

Ao final de uma solicitação concluída, deve existir um registro auditável contendo:

- NF anexada pelo estoque
- Histórico de ações do compras (incluindo data de contato com fornecedor)
- Certificado(s) anexado(s) pelo compras — um por lote faltante, conforme regra de negócio
- Status final que permita ao estoque retomar a conferência
