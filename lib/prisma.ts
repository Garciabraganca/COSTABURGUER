import { PrismaClient } from "@prisma/client";
import { assertDatabaseUrl } from "./assertDatabaseUrl";

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };
let warnedMissingDatabaseUrl = false;

function createPrismaClient(): PrismaClient | null {
  assertDatabaseUrl();

  if (!process.env.DATABASE_URL) {
    if (!warnedMissingDatabaseUrl) {
      console.warn(
        "DATABASE_URL não encontrada. Prisma desabilitado; usando modo demo em rotas compatíveis."
      );
      warnedMissingDatabaseUrl = true;
    }
    return null;
  }

  try {
    return new PrismaClient({
      log: ["error", "warn"]
    });
  } catch (error) {
    console.warn("Prisma Client não pôde ser inicializado", error);
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
