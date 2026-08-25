import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb, { type Pool, type PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPoolConfig(): PoolConfig {
  const rawUrl = process.env.DATABASE_URL || "mysql://root:123456@127.0.0.1:3306/makhana_gold";

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname || "127.0.0.1";
    // On Hostinger container, self-ip and localhost map to 127.0.0.1 TCP socket
    const resolvedHost = (host === "localhost" || host === "31.97.2.35") ? "127.0.0.1" : host;

    return {
      host: resolvedHost,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username) || "root",
      password: decodeURIComponent(parsed.password) || "",
      database: parsed.pathname.replace(/^\//, "") || "makhana_gold",
      connectionLimit: 5,
      connectTimeout: 8000,
      acquireTimeout: 8000,
      idleTimeout: 30000,
      minDelayValidation: 500,
      allowPublicKeyRetrieval: true,
      ssl: false,
    } as PoolConfig;
  } catch {
    return {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "makhana_gold",
      connectionLimit: 5,
      connectTimeout: 8000,
      acquireTimeout: 8000,
      allowPublicKeyRetrieval: true,
      ssl: false,
    } as PoolConfig;
  }
}

function createPrismaClient(): PrismaClient {
  const poolConfig = getPoolConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(poolConfig as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always attach to global scope to avoid pool leaks in production
globalForPrisma.prisma = prisma;



