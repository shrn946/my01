import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

export function getPrisma() {
  if (prismaInstance) return prismaInstance;

  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing. Please add it to your environment variables.");
    }
  }

  prismaInstance = globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = (null as unknown as PrismaClient); // Temporary placeholder to avoid breaking direct imports immediately
