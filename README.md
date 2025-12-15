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
2. Configure o banco (PostgreSQL) via variáveis de ambiente:
   ```bash
   export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
   export DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
   ```
   > Sem o `DATABASE_URL`, as rotas de API não conseguirão persistir pedidos. Sem o `DIRECT_URL`, o `npm run build` não aplicará migrations automaticamente.
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

### Auto-seed do catálogo (produção)
- Defina `AUTO_SEED_CATALOG=true` na Vercel antes de abrir `/montar` em um banco vazio.
- O app detecta catálogo vazio, popula categorias e ingredientes com os assets existentes em `public/ingredients` e grava o lock para não repetir.
- Depois de confirmado o preenchimento, a flag pode voltar para `false`.

## Testando o fluxo ponta a ponta
1. Monte um burger em `/montar` e siga até **Pagamento** para enviar o payload real para `POST /api/pedidos`.
2. Acompanhe em `/pedido/[id]` e avance status no painel da cozinha `/cozinha` (CONFIRMADO → PREPARANDO → PRONTO).
3. Despache a entrega via `/gerente` ou API `POST /api/entregas/despachar` para gerar um token público.
4. O motoboy abre `/entrega/[token]` (página pública) no celular e envia localização periodicamente para `/api/entregas/[token]/localizacao`.
5. O cliente acompanha pelo mesmo token, vendo status, endereço e última atualização de rota.

### Supabase Setup
1. No Supabase, acesse **Project Settings → Database → Connection string → URI** e copie **duas** conexões:
   - **Direct connection (5432)** → use em `DIRECT_URL` para migrations/seed.
   - **Pooler (6543)** → use em `DATABASE_URL` para o runtime (prisma pooler).
2. Crie um `.env` local a partir de `.env.example`, preenchendo:
   - `DATABASE_URL` com a conexão do pooler (`...pooler.supabase.com:6543?sslmode=require&pgbouncer=true`).
   - `DIRECT_URL` com a conexão direta (porta 5432 + `sslmode=require`).
   - `JWT_SECRET` com uma string longa e aleatória.
   - `ADMIN_BOOTSTRAP_KEY` com um segredo único para habilitar o primeiro Admin.
3. Rode localmente:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```
4. Na Vercel (Production e Preview), adicione as variáveis `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `AUTO_SEED_CATALOG` (use `1` para popular catálogos vazios) e `ADMIN_BOOTSTRAP_KEY` em **Project Settings → Environment Variables**. Sem `DIRECT_URL`, o `npm run build` em produção (hook da Vercel) não conseguirá aplicar migrations.
5. Para ambientes já publicados, aplique as migrations em produção com:
   ```bash
   npx prisma migrate deploy
   ```
6. Para garantir catálogos e tabelas mínimas em produção, execute:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   # ou use o script helper
   ./scripts/deploy.sh
   ```
   Em bancos vazios, mantenha `AUTO_SEED_CATALOG=1` para permitir popular o catálogo a partir do endpoint `/api/catalog`. Se a rota retornar `{ code: "MIGRATION_REQUIRED" }`, faltam migrations no Supabase.

### Deploy na Vercel
- O `npm run build` já executa `prisma generate` e `prisma migrate deploy` usando `DIRECT_URL`. Certifique-se de que `DIRECT_URL` aponta para a porta 5432 do Supabase com SSL.
- `DATABASE_URL` deve usar o pooler (porta 6543) para o runtime.
- Se o catálogo estiver vazio após as migrations, chame `/api/catalog?seed=1` (ou deixe `AUTO_SEED_CATALOG=1`) para popular a partir do manifest.

### Bootstrap seguro e painel de usuários
1. Após o deploy com o banco vazio, acesse `/admin/bootstrap` com a chave de ativação (`ADMIN_BOOTSTRAP_KEY`) para criar o primeiro Admin.
2. Ao finalizar o bootstrap, você será autenticado automaticamente e redirecionado para `/admin/usuarios`.
3. Somente usuários com role `ADMIN` conseguem listar, criar, editar, desativar e resetar senhas dos usuários (`ADMIN`, `GERENTE`, `COZINHEIRO`, `MOTOBOY`).
4. Rotas sensíveis de admin exigem JWT válido; mantenha o cookie `token` somente via login e logout pela UI.
