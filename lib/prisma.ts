import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const usesTransactionPooler =
      url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543";

    if (usesTransactionPooler) {
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
    }

    return url.toString();
  } catch {
    return value;
  }
}

export function getPrisma() {
  if (prismaInstance) return prismaInstance;

  const dbUrl = getDatabaseUrl();

  if (!dbUrl || !dbUrl.startsWith("postgres")) {
    console.error("Critical: DATABASE_URL is invalid or missing!", {
      exists: !!dbUrl,
      length: dbUrl?.length,
      prefix: dbUrl?.substring(0, 10)
    });
  }

  prismaInstance = globalForPrisma.prisma ??
    new PrismaClient({
      datasources: dbUrl ? {
        db: {
          url: dbUrl,
        },
      } : undefined,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = (null as unknown as PrismaClient); // Temporary placeholder to avoid breaking direct imports immediately
