-- Ensure cancelamento columns exist on Pedido
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "motivoCancelamento" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "canceladoEm" TIMESTAMP(3);
