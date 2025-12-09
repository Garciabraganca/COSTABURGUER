# Costa-Burger Full-stack (Next.js + Prisma)

Evolução do MVP estático para uma base full-stack em Next.js, mantendo o tema kraft artesanal e o fluxo de pedido em camadas.
Inclui páginas dedicadas para home, montagem, sacola, entrega, pagamento e rastreamento, além de APIs para pedidos, status e
posicionamento de entrega.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Defina a variável `DATABASE_URL` para usar PostgreSQL + Prisma (opcional). Sem ela, as APIs utilizam um store em memória para
   facilitar testes locais.
3. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse http://localhost:3000 e navegue pelos fluxos `/`, `/montar`, `/sacola`, `/entrega`, `/pagamento` e `/pedido/[id]`.

## Estrutura principal

- `pages/` – Páginas Next.js que refletem o fluxo original.
- `components/` – Header, navegação, pré-visualização do burger, lista de opções, sacola, resumo e linha do tempo do pedido.
- `context/OrderContext.js` – Estado compartilhado para montagem, sacola, extras e status simulados.
- `pages/api/pedidos` – Criação e listagem diária de pedidos (Prisma ou memória), atualização de status.
- `pages/api/entregas` – Endpoint para o motoboy atualizar latitude/longitude.
- `pages/api/mercadopago` – Stubs para preference e webhook de pagamento aprovado.
- `prisma/schema.prisma` – Modelagem de Pedido, ItemPedido, Endereco, StatusPedido e Entrega.

## Próximos passos

- Conectar o SDK oficial do Mercado Pago nos handlers de `preference` e `webhook`.
- Configurar WebSocket/Supabase Realtime para transmitir posição do entregador à página `/pedido/[id]`.
- Criar painel administrativo para cozinha e operação acompanhar pedidos do dia e emitir campanhas via WhatsApp.
