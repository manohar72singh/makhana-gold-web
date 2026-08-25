import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPoolConfig(): PoolConfig {
  const rawUrl = process.env.DATABASE_URL || "mysql://root:123456@127.0.0.1:3306/makhana_gold";

  try {
    const parsed = new URL(rawUrl);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username) || "root",
      password: decodeURIComponent(parsed.password) || "",
      database: parsed.pathname.replace(/^\//, "") || "makhana_gold",
      connectionLimit: 20,
      connectTimeout: 8000,
      acquireTimeout: 10000,
      idleTimeout: 30000,
      minDelayValidation: 500,
    };
  } catch {
    return {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "makhana_gold",
      connectionLimit: 20,
      connectTimeout: 8000,
      acquireTimeout: 10000,
    };
  }
}

function createPrismaClient() {
  const poolConfig = getPoolConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(poolConfig as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
