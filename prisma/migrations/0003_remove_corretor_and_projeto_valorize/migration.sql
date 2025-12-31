-- Migration: Remove CORRETOR role and projeto_valorize field
-- This migration safely removes deprecated features

-- Step 1: Remap any CORRETOR users to GERENTE before removing the enum value
UPDATE "usuarios" SET "role" = 'GERENTE' WHERE "role" = 'CORRETOR';

-- Step 2: Drop the projeto_valorize column if it exists
ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "projeto_valorize";

-- Step 3: Recreate the enum without CORRETOR
-- PostgreSQL doesn't support DROP VALUE from enum, so we need to recreate it

-- Create new enum type without CORRETOR
CREATE TYPE "user_role_new" AS ENUM ('ADMIN', 'GERENTE', 'COZINHEIRO', 'MOTOBOY');

-- Update the column to use the new enum type
ALTER TABLE "usuarios"
  ALTER COLUMN "role" TYPE "user_role_new"
  USING ("role"::text::"user_role_new");

-- Drop the old enum type
DROP TYPE "user_role";

-- Rename new enum to original name
ALTER TYPE "user_role_new" RENAME TO "user_role";
