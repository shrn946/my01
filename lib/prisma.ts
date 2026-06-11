import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

export function getPrisma() {
  if (prismaInstance) return prismaInstance;

  // Strip potential quotes that might be added in deployment UIs
  const dbUrl = process.env.DATABASE_URL?.replace(/^["']|["']$/g, '');
  const directUrl = process.env.DIRECT_URL?.replace(/^["']|["']$/g, '');

  if (!dbUrl || !dbUrl.startsWith("postgres")) {
    console.error("Critical: DATABASE_URL is invalid or missing!", {
      exists: !!dbUrl,
      length: dbUrl?.length,
      prefix: dbUrl?.substring(0, 10)
    });
    
    // If we're in a build environment or don't have a URL, we can return a dummy or wait
    // But for the client to at least instantiate, we need a valid-looking string if we pass it
    // Alternatively, we can let Prisma use the environment variable directly which it handles better if missing (throws on usage instead of constructor)
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
