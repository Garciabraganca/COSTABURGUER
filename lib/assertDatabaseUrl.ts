const ERROR_MESSAGE =
  "DATABASE_URL must point to Supabase, Neon, or compatible PostgreSQL provider with sslmode=require.";

export type DatabaseUrlValidationSuccess = {
  ok: true;
  normalizedUrl: string;
  host: string;
  port: number;
  isPooler: boolean;
  hasSslmode: boolean;
  hasPgbouncer: boolean;
  provider: 'supabase' | 'neon' | 'other';
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

  // Patterns for different providers
  const supabaseHostPattern = /^db\.[^.]+\.supabase\.co$/;
  const supabasePoolerPattern = /\.pooler\.supabase\.com$/;
  const neonHostPattern = /\.neon\.tech$/;

  const isSupabase = supabaseHostPattern.test(host);
  const isSupabasePooler = supabasePoolerPattern.test(host);
  const isNeon = neonHostPattern.test(host);
  const isPooler = isSupabasePooler || host.includes('-pooler');

  const details = {
    normalizedUrl,
    host,
    port: port ? Number(port) : null,
    hasSslmode,
    hasPgbouncer,
    isPooler,
    isSupabase,
    isNeon,
  } satisfies Record<string, unknown>;

  // Block Prisma Data Proxy
  if (host.endsWith("db.prisma.io")) {
    return { ok: false, reason: ERROR_MESSAGE, details } as const;
  }

  // Require SSL for production
  if (!hasSslmode) {
    return { ok: false, reason: ERROR_MESSAGE, details } as const;
  }

  // Neon validation
  if (isNeon) {
    const resolvedPort = port || "5432";
    return {
      ok: true,
      normalizedUrl,
      host,
      port: Number(resolvedPort),
      isPooler,
      hasSslmode,
      hasPgbouncer,
      provider: 'neon',
    } as const;
  }

  // Supabase direct connection
  if (isSupabase) {
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
      provider: 'supabase',
    } as const;
  }

  // Supabase pooler connection
  if (isSupabasePooler) {
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
      provider: 'supabase',
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
