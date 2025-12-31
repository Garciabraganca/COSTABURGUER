-- AlterTable: Add cancellation fields to Pedido
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "motivoCancelamento" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "canceladoEm" TIMESTAMP(3);

-- CreateTable: Cupom
CREATE TABLE IF NOT EXISTS "Cupom" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipoDesconto" TEXT NOT NULL,
    "valorDesconto" DOUBLE PRECISION NOT NULL,
    "valorMinimo" DOUBLE PRECISION,
    "valorMaximo" DOUBLE PRECISION,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "limiteUsos" INTEGER,
    "usosAtual" INTEGER NOT NULL DEFAULT 0,
    "usoUnico" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PedidoCupom
CREATE TABLE IF NOT EXISTS "PedidoCupom" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "cupomId" TEXT NOT NULL,
    "codigoUsado" TEXT NOT NULL,
    "valorDesconto" DOUBLE PRECISION NOT NULL,
    "clienteCelular" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoCupom_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AlertaEstoque
CREATE TABLE IF NOT EXISTS "AlertaEstoque" (
    "id" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemNome" TEXT NOT NULL,
    "estoqueAtual" DOUBLE PRECISION NOT NULL,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "resolvidoEm" TIMESTAMP(3),
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "notificadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertaEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Cupom indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Cupom_codigo_key" ON "Cupom"("codigo");
CREATE INDEX IF NOT EXISTS "Cupom_codigo_idx" ON "Cupom"("codigo");
CREATE INDEX IF NOT EXISTS "Cupom_ativo_idx" ON "Cupom"("ativo");

-- CreateIndex: PedidoCupom indexes
CREATE UNIQUE INDEX IF NOT EXISTS "PedidoCupom_pedidoId_key" ON "PedidoCupom"("pedidoId");
CREATE INDEX IF NOT EXISTS "PedidoCupom_cupomId_idx" ON "PedidoCupom"("cupomId");
CREATE INDEX IF NOT EXISTS "PedidoCupom_clienteCelular_idx" ON "PedidoCupom"("clienteCelular");

-- CreateIndex: AlertaEstoque indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AlertaEstoque_tipoItem_itemId_status_key" ON "AlertaEstoque"("tipoItem", "itemId", "status");
CREATE INDEX IF NOT EXISTS "AlertaEstoque_status_idx" ON "AlertaEstoque"("status");
CREATE INDEX IF NOT EXISTS "AlertaEstoque_createdAt_idx" ON "AlertaEstoque"("createdAt");

-- AddForeignKey: PedidoCupom -> Cupom
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PedidoCupom_cupomId_fkey') THEN
        ALTER TABLE "PedidoCupom" ADD CONSTRAINT "PedidoCupom_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "Cupom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
