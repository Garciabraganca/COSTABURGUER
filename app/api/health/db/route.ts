import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { validateDatabaseUrl } from '@/lib/assertDatabaseUrl';
import prismaPackage from '@prisma/client/package.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DbInfoRow = { db: string | null; schema: string | null };
type UsuariosExistsRow = { usuarios_exists: boolean };
type PedidosExistsRow = { pedidos_exists: boolean };
type PublicTablesRow = { public_tables: number };

type HealthError = {
  name: string;
  message: string;
  code: string | null;
};

type HealthSuccess = {
  ok: true;
  runtime: 'vercel' | 'local';
  databaseUrlHost: string | null;
  databaseUrlHasSslmode: boolean;
  databaseUrlHasPgbouncer: boolean;
  directUrlHost: string | null;
  directUrlPresent: boolean;
  databaseUsage: string;
  prismaClientVersion: string;
  db: string | null;
  schema: string | null;
  usuarios_exists: boolean;
  pedidos_exists: boolean;
  public_tables: number;
};

type HealthFailure = {
  ok: false;
  runtime: 'vercel' | 'local';
  databaseUrlHost: string | null;
  databaseUrlHasSslmode: boolean;
  databaseUrlHasPgbouncer: boolean;
  directUrlHost: string | null;
  directUrlPresent: boolean;
  databaseUsage: string;
  prismaClientVersion: string;
  reason?: string;
  error?: HealthError;
};

export async function GET() {
  let diagnostics: Diagnostics | null = null;

  try {
    diagnostics = buildDiagnostics();
    const { databaseUrlValidation } = diagnostics;
    const baseDiagnostics = toResponseDiagnostics(diagnostics);

    if (databaseUrlValidation.ok === false) {
      return NextResponse.json<HealthFailure>(
        { ok: false, ...baseDiagnostics, reason: databaseUrlValidation.reason },
        { status: 200 }
      );
    }

    if (!prisma) {
      return NextResponse.json<HealthFailure>(
        {
          ok: false,
          ...baseDiagnostics,
          reason: 'Banco não configurado (DATABASE_URL)',
          error: {
            name: 'PrismaUnavailable',
            message: 'Banco não configurado (DATABASE_URL)',
            code: null
          }
        },
        { status: 503 }
      );
    }

    const [dbInfo] = await prisma.$queryRaw<DbInfoRow[]>`select current_database() as db, current_schema() as schema;`;
    const [usuariosRow] = await prisma.$queryRaw<UsuariosExistsRow[]>`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'usuarios'
      ) as usuarios_exists;
    `;
    const [pedidosRow] = await prisma.$queryRaw<PedidosExistsRow[]>`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'pedidos'
      ) as pedidos_exists;
    `;
    const [publicTablesRow] = await prisma.$queryRaw<PublicTablesRow[]>`
      select count(*)::int as public_tables
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE';
    `;

    const response: HealthSuccess = {
      ok: true,
      ...baseDiagnostics,
      db: dbInfo?.db ?? null,
      schema: dbInfo?.schema ?? null,
      usuarios_exists: usuariosRow?.usuarios_exists ?? false,
      pedidos_exists: pedidosRow?.pedidos_exists ?? false,
      public_tables: publicTablesRow?.public_tables ?? 0
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const safeError = normalizeError(error);
    const fallbackDiagnostics = diagnostics ? toResponseDiagnostics(diagnostics) : toResponseDiagnostics(buildDiagnostics());

    return NextResponse.json<HealthFailure>(
      {
        ok: false,
        ...fallbackDiagnostics,
        error: safeError
      },
      { status: 500 }
    );
  }
}

type Diagnostics = {
  runtime: 'vercel' | 'local';
  prismaClientVersion: string;
  databaseUrlHost: string | null;
  databaseUrlHasSslmode: boolean;
  databaseUrlHasPgbouncer: boolean;
  directUrlHost: string | null;
  directUrlPresent: boolean;
  databaseUrlValidation: ReturnType<typeof validateDatabaseUrl>;
};

function buildDiagnostics(): Diagnostics {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const databaseUrlValidation = validateDatabaseUrl(databaseUrl);
  const validationDetails = databaseUrlValidation.ok === false ? databaseUrlValidation.details ?? null : null;
  const databaseUrlHost = databaseUrlValidation.ok === false
    ? typeof validationDetails?.host === 'string'
      ? validationDetails.host
      : null
    : databaseUrlValidation.host;
  const databaseUrlHasSslmode = databaseUrlValidation.ok === false
    ? Boolean(validationDetails?.hasSslmode)
    : databaseUrlValidation.hasSslmode;
  const databaseUrlHasPgbouncer = databaseUrlValidation.ok === false
    ? Boolean(validationDetails?.hasPgbouncer)
    : databaseUrlValidation.hasPgbouncer;
  const directUrlHost = safeExtractHost(directUrl);
  const directUrlPresent = Boolean(directUrl);
  const runtime: 'vercel' | 'local' = process.env.VERCEL ? 'vercel' : 'local';
  const prismaClientVersion = prismaPackage.version ?? 'unknown';

  return {
    databaseUrlHost,
    databaseUrlHasSslmode,
    databaseUrlHasPgbouncer,
    directUrlHost,
    directUrlPresent,
    runtime,
    prismaClientVersion,
    databaseUrlValidation
  };
}

function toResponseDiagnostics(diagnostics: Diagnostics) {
  const {
    runtime,
    prismaClientVersion,
    databaseUrlHost,
    databaseUrlHasSslmode,
    databaseUrlHasPgbouncer,
    directUrlHost,
    directUrlPresent
  } = diagnostics;

  return {
    runtime,
    prismaClientVersion,
    databaseUrlHost,
    databaseUrlHasSslmode,
    databaseUrlHasPgbouncer,
    directUrlHost,
    directUrlPresent,
    databaseUsage: buildDatabaseUsageMessage(directUrlPresent)
  };
}

function safeExtractHost(url: string | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (_error) {
    return null;
  }
}

function buildDatabaseUsageMessage(hasDirectUrl: boolean) {
  const directUrlHint = hasDirectUrl
    ? 'Migrations/scripts devem usar DIRECT_URL (conexão direta 5432).'
    : 'DIRECT_URL não configurada; use conexão direta (5432) para migrations/scripts.';

  return `Runtime usa DATABASE_URL (pooler quando disponível). ${directUrlHint}`;
}

function normalizeError(error: unknown): HealthError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: truncateMessage(error.message),
      // @ts-expect-error Prisma errors may carry a code property
      code: typeof (error as { code?: string }).code === 'string' ? (error as { code: string }).code : null
    };
  }

  return {
    name: 'UnknownError',
    message: 'Erro desconhecido',
    code: null
  };
}

function truncateMessage(message: string, maxLength = 200) {
  return message.length > maxLength ? `${message.slice(0, maxLength - 1)}…` : message;
}
