# Usuários e papéis

## Operador de estoque

**Responsabilidade principal:** receber materiais, conferir certificados de qualidade das chapas e garantir conformidade com padrões internos antes de liberar o material.

**No sistema:**

| Ação | Descrição |
| ---- | --------- |
| Cadastrar fornecedor | Cria fornecedores na base (nome, CNPJ, descrição) para uso nas solicitações |
| Abrir solicitação | Acessa a aba **Solicitar certificado**, informa fornecedor, data da NF e anexa a NF |
| Acompanhar solicitações | Visualiza status das solicitações abertas por ele ou pela equipe de estoque |
| Receber certificados | É notificado quando o compras anexa os certificados; retoma a conferência |

**Não faz no sistema:** contato direto com fornecedor para pedido de certificado (papel do compras).

---

## Operador de compras

**Responsabilidade principal:** relacionamento com fornecedores; cobrar documentação faltante e devolver ao estoque.

**No sistema:**

| Ação | Descrição |
| ---- | --------- |
| Receber notificação | E-mail com resumo da solicitação e **magic link** para abrir a solicitação |
| Visualizar solicitação | Vê fornecedor, data da NF, NF anexada e observações do estoque |
| Registrar contato com fornecedor | Indica **quando** enviou e-mail/solicitação ao fornecedor |
| Anexar certificados | Faz upload dos certificados recebidos do fornecedor (um por lote) |
| Concluir solicitação | Finaliza o retorno ao estoque após anexar todos os certificados necessários |

**Acesso:** via magic link no e-mail (acesso direto à solicitação). Autenticação adicional pode ser definida na implementação.

---

## Fornecedor

**Papel externo** — não utiliza o sistema diretamente.

Recebe solicitação do compras por canal habitual (e-mail, etc.) e envia os certificados de qualidade dos lotes. O compras registra no sistema o recebimento anexando os arquivos.

---

## Matriz resumida de permissões

| Funcionalidade | Estoque | Compras |
| -------------- | :-----: | :-----: |
| Cadastro de fornecedor | ✓ | — |
| Abrir solicitação | ✓ | — |
| Listar solicitações (estoque) | ✓ | — |
| Abrir solicitação via magic link | — | ✓ |
| Registrar envio ao fornecedor | — | ✓ |
| Anexar certificados | — | ✓ |
| Concluir solicitação | — | ✓ |
