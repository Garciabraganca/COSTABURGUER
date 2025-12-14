-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADM', 'GERENTE', 'COZINHEIRO', 'MOTOBOY');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingrediente" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "imagem" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "categoriaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingrediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acompanhamento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "imagem" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Acompanhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "nome" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "tipoEntrega" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxaEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "desconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "custoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lucro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "itens" JSONB,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedidoBurger" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedidoBurger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedidoIngrediente" (
    "id" TEXT NOT NULL,
    "itemBurgerId" TEXT NOT NULL,
    "ingredienteId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedidoIngrediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedidoAcompanhamento" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "acompanhamentoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedidoAcompanhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "estoqueAnterior" DOUBLE PRECISION NOT NULL,
    "estoqueAtual" DOUBLE PRECISION NOT NULL,
    "pedidoId" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO',
    "motoboyNome" TEXT,
    "motoboyCelular" TEXT,
    "token" TEXT NOT NULL,
    "latitudeAtual" DOUBLE PRECISION,
    "longitudeAtual" DOUBLE PRECISION,
    "ultimaAtualizacao" TIMESTAMP(3),
    "despachadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iniciadoEm" TIMESTAMP(3),
    "finalizadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalizacaoEntrega" (
    "id" TEXT NOT NULL,
    "entregaId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "precisao" DOUBLE PRECISION,
    "velocidade" DOUBLE PRECISION,
    "direcao" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalizacaoEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ingrediente_slug_key" ON "Ingrediente"("slug");

-- CreateIndex
CREATE INDEX "Ingrediente_categoriaId_idx" ON "Ingrediente"("categoriaId");

-- CreateIndex
CREATE INDEX "Ingrediente_slug_idx" ON "Ingrediente"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Acompanhamento_slug_key" ON "Acompanhamento"("slug");

-- CreateIndex
CREATE INDEX "Acompanhamento_slug_idx" ON "Acompanhamento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE INDEX "ItemPedidoBurger_pedidoId_idx" ON "ItemPedidoBurger"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedidoIngrediente_itemBurgerId_idx" ON "ItemPedidoIngrediente"("itemBurgerId");

-- CreateIndex
CREATE INDEX "ItemPedidoIngrediente_ingredienteId_idx" ON "ItemPedidoIngrediente"("ingredienteId");

-- CreateIndex
CREATE INDEX "ItemPedidoAcompanhamento_pedidoId_idx" ON "ItemPedidoAcompanhamento"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedidoAcompanhamento_acompanhamentoId_idx" ON "ItemPedidoAcompanhamento"("acompanhamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_tipoItem_itemId_idx" ON "MovimentacaoEstoque"("tipoItem", "itemId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_pedidoId_idx" ON "MovimentacaoEstoque"("pedidoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_createdAt_idx" ON "MovimentacaoEstoque"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_pedidoId_key" ON "Entrega"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_token_key" ON "Entrega"("token");

-- CreateIndex
CREATE INDEX "Entrega_token_idx" ON "Entrega"("token");

-- CreateIndex
CREATE INDEX "Entrega_status_idx" ON "Entrega"("status");

-- CreateIndex
CREATE INDEX "LocalizacaoEntrega_entregaId_idx" ON "LocalizacaoEntrega"("entregaId");

-- CreateIndex
CREATE INDEX "LocalizacaoEntrega_createdAt_idx" ON "LocalizacaoEntrega"("createdAt");

-- AddForeignKey
ALTER TABLE "Ingrediente" ADD CONSTRAINT "Ingrediente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoBurger" ADD CONSTRAINT "ItemPedidoBurger_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoIngrediente" ADD CONSTRAINT "ItemPedidoIngrediente_itemBurgerId_fkey" FOREIGN KEY ("itemBurgerId") REFERENCES "ItemPedidoBurger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoIngrediente" ADD CONSTRAINT "ItemPedidoIngrediente_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "Ingrediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoAcompanhamento" ADD CONSTRAINT "ItemPedidoAcompanhamento_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoAcompanhamento" ADD CONSTRAINT "ItemPedidoAcompanhamento_acompanhamentoId_fkey" FOREIGN KEY ("acompanhamentoId") REFERENCES "Acompanhamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalizacaoEntrega" ADD CONSTRAINT "LocalizacaoEntrega_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "Entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

