# Conceitos do domínio

| Termo | Descrição |
| ----- | --------- |
| **Chapa** | Material plano recebido de fornecedor, utilizado na produção da metalúrgica |
| **Lote** | Conjunto identificável de chapas dentro de uma NF; cada lote possui seu próprio certificado de qualidade |
| **Certificado de qualidade** | Documento emitido pelo fornecedor com detalhes técnicos da chapa/lote (composição, ensaios, normas, etc.) |
| **Conferência** | Verificação pelo operador de estoque dos dados do certificado contra os **padrões internos de qualidade** (documentação da qualidade da fábrica) |
| **NF (Nota Fiscal)** | Documento fiscal que registra a entrada das chapas; pode conter **vários lotes** |
| **Fornecedor** | Empresa que fornece as chapas; identificado por nome, CNPJ e descrição opcional |
| **Solicitação de certificado** | Registro no sistema aberto pelo estoque quando uma NF chega **sem** os certificados necessários |
| **Magic link** | URL única e segura enviada por e-mail ao compras, apontando diretamente para uma solicitação específica |
| **Padrões internos / Doc da qualidade** | Documentação interna da fábrica que define critérios de aceite dos certificados (referência externa ao sistema) |

## Relação entre NF, lotes e certificados

```
NF (1)
 ├── Lote A  →  Certificado A  (obrigatório)
 ├── Lote B  →  Certificado B  (obrigatório)
 └── Lote C  →  Certificado C  (obrigatório)
```

- Uma **NF** agrupa um ou mais **lotes**
- Cada **lote** deve ter **exatamente um certificado** associado na conferência
- Uma solicitação trata de **certificados faltantes** de uma NF específica; o compras pode anexar **vários arquivos** (um por lote)

## Fornecedor

Entidade cadastrada previamente pelo operador de estoque:

| Campo | Obrigatório | Descrição |
| ----- | :---------: | --------- |
| Nome | Sim | Razão social ou nome fantasia |
| CNPJ | Sim | Identificação fiscal |
| Descrição | Não | Observações (materiais fornecidos, contatos, etc.) |

O fornecedor é selecionado via **combobox** ao abrir uma solicitação.
