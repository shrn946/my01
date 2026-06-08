import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.NODE_ENV === "production") {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Please add it to your environment variables.");
  }
  if (!process.env.DIRECT_URL) {
    console.warn("DIRECT_URL is missing. If you're using Supabase with Prisma, you should provide a DIRECT_URL for stable connections.");
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function getPrisma() {
  return prisma;
}
