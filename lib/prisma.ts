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
  }

  prismaInstance = globalForPrisma.prisma ??
    new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = (null as unknown as PrismaClient); // Temporary placeholder to avoid breaking direct imports immediately
