const ERROR_MESSAGE =
  "DATABASE_URL must point to Supabase (db.<ref>.supabase.co:5432) or Supabase Pooler (*.pooler.supabase.com:6543). Prisma Data Proxy (db.prisma.io) is not allowed.";

type DatabaseUrlValidationSuccess = {
  ok: true;
  parsed: {
    host: string;
    port: string;
    hasSslmode: boolean;
    hasPgbouncer: boolean;
  };
};

type DatabaseUrlValidationFailure = {
  ok: false;
  reason: string;
  parsed: {
    host: string | null;
    port: string | null;
    hasSslmode: boolean;
    hasPgbouncer: boolean;
  };
};

export type DatabaseUrlValidationResult =
  | DatabaseUrlValidationSuccess
  | DatabaseUrlValidationFailure;

export function validateDatabaseUrl(url = process.env.DATABASE_URL): DatabaseUrlValidationResult {
  if (!url) {
    return {
      ok: false,
      reason: ERROR_MESSAGE,
      parsed: { host: null, port: null, hasSslmode: false, hasPgbouncer: false },
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return {
      ok: false,
      reason: ERROR_MESSAGE,
      parsed: { host: null, port: null, hasSslmode: false, hasPgbouncer: false },
    };
  }

  const { hostname: host, port } = parsedUrl;
  const sslmode = parsedUrl.searchParams.get("sslmode");
  const hasSslmode = sslmode === "require";
  const hasPgbouncer = parsedUrl.searchParams.get("pgbouncer") === "true";

  const parsed = {
    host,
    port: port || "",
    hasSslmode,
    hasPgbouncer,
  };

  const supabaseHostPattern = /^db\.[^.]+\.supabase\.co$/;
  const poolerHostPattern = /\.pooler\.supabase\.com$/;

  if (host.endsWith("db.prisma.io")) {
    return { ok: false, reason: ERROR_MESSAGE, parsed };
  }

  if (!hasSslmode) {
    return { ok: false, reason: ERROR_MESSAGE, parsed };
  }

  if (supabaseHostPattern.test(host)) {
    const resolvedPort = port || "5432";
    if (resolvedPort !== "5432") {
      return { ok: false, reason: ERROR_MESSAGE, parsed };
    }

    return { ok: true, parsed };
  }

  if (poolerHostPattern.test(host)) {
    if (port !== "6543") {
      return { ok: false, reason: ERROR_MESSAGE, parsed };
    }
    if (!hasPgbouncer) {
      return { ok: false, reason: ERROR_MESSAGE, parsed };
    }

    return { ok: true, parsed };
  }

  return { ok: false, reason: ERROR_MESSAGE, parsed };
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

  if (!validation.ok) {
    throw new Error(validation.reason ?? ERROR_MESSAGE);
  }
}
