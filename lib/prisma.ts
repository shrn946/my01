import "server-only";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const globalForPrisma = globalThis as unknown as { prisma?: any };

export function getPrisma() {
  const { PrismaClient } = require("@prisma/client");
  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}
