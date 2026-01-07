-- Add missing projeto_valorize flag to usuarios table
ALTER TABLE "usuarios"
ADD COLUMN IF NOT EXISTS "projeto_valorize" BOOLEAN NOT NULL DEFAULT false;
