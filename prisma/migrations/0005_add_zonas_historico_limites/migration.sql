-- CreateTable: ZonaEntrega
CREATE TABLE IF NOT EXISTS "ZonaEntrega" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'bairro',
    "bairros" TEXT[],
    "distanciaMin" DOUBLE PRECISION,
    "distanciaMax" DOUBLE PRECISION,
    "cepInicio" TEXT,
    "cepFim" TEXT,
    "taxaEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempoEstimado" INTEGER,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZonaEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HistoricoPreco
CREATE TABLE IF NOT EXISTS "HistoricoPreco" (
    "id" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "precoAnterior" DOUBLE PRECISION NOT NULL,
    "precoNovo" DOUBLE PRECISION NOT NULL,
    "custoAnterior" DOUBLE PRECISION,
    "custoNovo" DOUBLE PRECISION,
    "usuarioId" TEXT,
    "usuarioNome" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoPreco_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LimiteBurger
CREATE TABLE IF NOT EXISTS "LimiteBurger" (
    "id" TEXT NOT NULL,
    "maxIngredientes" INTEGER NOT NULL DEFAULT 15,
    "maxPorCategoria" INTEGER NOT NULL DEFAULT 5,
    "maxBurgersNoPedido" INTEGER NOT NULL DEFAULT 10,
    "limitesPorCategoria" JSONB,
    "valorMinimo" DOUBLE PRECISION,
    "valorMaximo" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LimiteBurger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ZonaEntrega indexes
CREATE INDEX IF NOT EXISTS "ZonaEntrega_ativo_idx" ON "ZonaEntrega"("ativo");
CREATE INDEX IF NOT EXISTS "ZonaEntrega_tipo_idx" ON "ZonaEntrega"("tipo");

-- CreateIndex: HistoricoPreco indexes
CREATE INDEX IF NOT EXISTS "HistoricoPreco_tipoItem_itemId_idx" ON "HistoricoPreco"("tipoItem", "itemId");
CREATE INDEX IF NOT EXISTS "HistoricoPreco_createdAt_idx" ON "HistoricoPreco"("createdAt");

-- Insert default LimiteBurger configuration
INSERT INTO "LimiteBurger" ("id", "maxIngredientes", "maxPorCategoria", "maxBurgersNoPedido", "limitesPorCategoria", "ativo", "createdAt", "updatedAt")
SELECT
    'default-limits',
    15,
    5,
    10,
    '{"pao": 2, "carne": 4, "queijo": 3, "molho": 4, "vegetal": 6, "extra": 5}'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "LimiteBurger" WHERE "id" = 'default-limits');
