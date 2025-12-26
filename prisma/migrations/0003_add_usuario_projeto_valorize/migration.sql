-- Add missing projeto_valorize flag to usuarios
ALTER TABLE "usuarios"
ADD COLUMN IF NOT EXISTS "projeto_valorize" BOOLEAN NOT NULL DEFAULT false;
