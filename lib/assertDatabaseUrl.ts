const ERROR_MESSAGE =
  "DATABASE_URL must point to Supabase (db.<ref>.supabase.co:5432) or Supabase Pooler (*.pooler.supabase.com:6543). Prisma Data Proxy (db.prisma.io) is not allowed.";

export type DatabaseUrlValidationSuccess = {
  ok: true;
  normalizedUrl: string;
  host: string;
  port: number;
  isPooler: boolean;
  hasSslmode: boolean;
  hasPgbouncer: boolean;
};

export type DatabaseUrlValidationFailure = {
  ok: false;
  reason: string;
  details?: Record<string, unknown>;
};

export type DatabaseUrlValidationResult =
  | DatabaseUrlValidationSuccess
  | DatabaseUrlValidationFailure;

export function validateDatabaseUrl(url = process.env.DATABASE_URL): DatabaseUrlValidationResult {
  if (!url) {
    return { ok: false, reason: ERROR_MESSAGE } as const;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return { ok: false, reason: ERROR_MESSAGE, details: { url } } as const;
  }

  const { hostname: host, port } = parsedUrl;
  const sslmode = parsedUrl.searchParams.get("sslmode");
  const hasSslmode = sslmode === "require";
  const hasPgbouncer = parsedUrl.searchParams.get("pgbouncer") === "true";

  const normalizedUrl = parsedUrl.toString();
  const supabaseHostPattern = /^db\.[^.]+\.supabase\.co$/;
  const poolerHostPattern = /\.pooler\.supabase\.com$/;
  const isPooler = poolerHostPattern.test(host);

  const details = {
    normalizedUrl,
    host,
    port: port ? Number(port) : null,
    hasSslmode,
    hasPgbouncer,
    isPooler,
  } satisfies Record<string, unknown>;

  if (host.endsWith("db.prisma.io")) {
    return { ok: false, reason: ERROR_MESSAGE, details } as const;
  }

  if (!hasSslmode) {
    return { ok: false, reason: ERROR_MESSAGE, details } as const;
  }

  if (supabaseHostPattern.test(host)) {
    const resolvedPort = port || "5432";
    if (resolvedPort !== "5432") {
      return { ok: false, reason: ERROR_MESSAGE, details } as const;
    }

    return {
      ok: true,
      normalizedUrl,
      host,
      port: Number(resolvedPort),
      isPooler,
      hasSslmode,
      hasPgbouncer,
    } as const;
  }

  if (isPooler) {
    if (port !== "6543") {
      return { ok: false, reason: ERROR_MESSAGE, details } as const;
    }
    if (!hasPgbouncer) {
      return { ok: false, reason: ERROR_MESSAGE, details } as const;
    }

    return {
      ok: true,
      normalizedUrl,
      host,
      port: 6543,
      isPooler,
      hasSslmode,
      hasPgbouncer,
    } as const;
  }

  return { ok: false, reason: ERROR_MESSAGE, details } as const;
}

export function assertDatabaseUrl() {
  if (process.env.VERCEL !== "1" || process.env.NODE_ENV !== "production") {
    return;
  }

  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.VERCEL_BUILD_STEP
  ) {
    return;
  }

  const validation = validateDatabaseUrl();

  if (validation.ok === false) {
    throw new Error(validation.reason ?? ERROR_MESSAGE);
  }
}
