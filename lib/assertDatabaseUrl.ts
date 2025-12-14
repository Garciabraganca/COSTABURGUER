const ERROR_MESSAGE =
  "DATABASE_URL must point to Supabase (db.<ref>.supabase.co:5432) or Supabase Pooler (*.pooler.supabase.com:6543). Prisma Data Proxy (db.prisma.io) is not allowed.";

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

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(ERROR_MESSAGE);
  }

  let host: string;
  let port: string;
  let searchParams: URLSearchParams;
  try {
    const parsedUrl = new URL(databaseUrl);
    host = parsedUrl.hostname;
    port = parsedUrl.port;
    searchParams = parsedUrl.searchParams;
  } catch (error) {
    throw new Error(ERROR_MESSAGE);
  }

  if (host.endsWith("db.prisma.io")) {
    throw new Error(ERROR_MESSAGE);
  }

  const sslmode = searchParams.get("sslmode");
  if (sslmode !== "require") {
    throw new Error(ERROR_MESSAGE);
  }

  const supabaseHostPattern = /^db\.[^.]+\.supabase\.co$/;
  const poolerHostPattern = /\.pooler\.supabase\.com$/;

  if (supabaseHostPattern.test(host)) {
    const resolvedPort = port || "5432";
    if (resolvedPort !== "5432") {
      throw new Error(ERROR_MESSAGE);
    }
    return;
  }

  if (poolerHostPattern.test(host)) {
    if (port !== "6543") {
      throw new Error(ERROR_MESSAGE);
    }
    if (searchParams.get("pgbouncer") !== "true") {
      throw new Error(ERROR_MESSAGE);
    }
    return;
  }

  throw new Error(ERROR_MESSAGE);
}
