import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { requireEnv } from "@/lib/env";

// Next.js dev mode re-evaluates modules on every hot reload, which would open a
// new SQLite handle each time. Cache the client on globalThis to avoid that.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: requireEnv("DATABASE_URL") });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
