export function assertDatabaseUrl() {
  if (process.env.VERCEL !== "1" || process.env.NODE_ENV !== "production") {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  let host: string;
  try {
    const parsedUrl = new URL(databaseUrl);
    host = parsedUrl.hostname;
  } catch (error) {
    throw new Error(
      "DATABASE_URL is invalid. Set DATABASE_URL to the Supabase connection string for production."
    );
  }

  if (host.endsWith("db.prisma.io")) {
    throw new Error(
      "DATABASE_URL is pointing to db.prisma.io (Prisma Data Proxy). Set DATABASE_URL to Supabase connection string for production."
    );
  }
}
