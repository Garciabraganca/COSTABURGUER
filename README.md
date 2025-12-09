# Costa-Burger – App full-stack (Next.js + Prisma)

Aplicação full-stack com App Router do Next.js 14 para montar burgers em camadas, fechar pedido e acompanhar status. O visual segue o tema kraft/vermelho artesanal do MVP original.

## Stack
- Next.js 14 (App Router)
- React 18
- Prisma + PostgreSQL (models de `Pedido`)
- TypeScript

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o banco (PostgreSQL) via variável de ambiente:
   ```bash
   export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
   ```
   > Sem o `DATABASE_URL`, as rotas de API não conseguirão persistir pedidos.
3. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` e navegue pelo fluxo:
   - `/` (Home)
   - `/montar` (montagem em camadas)
   - `/sacola` (itens e extras)
   - `/entrega` (dados do cliente/retirada)
   - `/pagamento` (simulação de pagamento)
   - `/pedido/[id]` (rastreamento e avanço de status)

## Estrutura principal
- `app/` – Páginas do App Router, layout global e handlers de API em `app/api/pedidos`.
- `components/` – Header, Footer, StepsNav, BurgerPreview, sacola/resumo e timeline.
- `context/OrderContext.tsx` – Estado global do pedido (montagem, extras, cliente e payload para API).
- `lib/` – Prisma Client singleton (`prisma.ts`) e catálogo de opções (`menuData.ts`).
- `prisma/schema.prisma` – Modelo mínimo de `Pedido` com status e itens em JSON.
- `styles/globals.css` – Tema kraft compartilhado entre as páginas.

## Observações
- O botão “Simular pagamento aprovado” apenas cria o pedido via `/api/pedidos` e redireciona para o rastreamento.
- O avanço de status em `/pedido/[id]` é simulado com PATCH na mesma rota.
- Integração real com Mercado Pago/WhatsApp pode ser adicionada nos endpoints existentes.
