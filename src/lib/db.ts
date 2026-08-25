import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { Pool, PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPoolConfig(): PoolConfig {
  const rawUrl = process.env.DATABASE_URL || "mysql://root:123456@127.0.0.1:3306/makhana_gold";
  // Set this when TCP to 127.0.0.1 can't reach MariaDB from the app's container
  // (e.g. shared hosting where the app and DB run in isolated network namespaces).
  // Find the real path with: mysql_config --socket
  const socketPath = process.env.DB_SOCKET_PATH;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname || "127.0.0.1";
    const user = decodeURIComponent(parsed.username) || "root";
    const password = decodeURIComponent(parsed.password) || "";
    const database = parsed.pathname.replace(/^\//, "") || "makhana_gold";

    if (socketPath) {
      return {
        socketPath,
        user,
        password,
        database,
        connectionLimit: 5,
        connectTimeout: 8000,
        acquireTimeout: 8000,
        idleTimeout: 30000,
        minDelayValidation: 500,
        allowPublicKeyRetrieval: true,
      } as PoolConfig;
    }

    return {
      host,
      port: Number(parsed.port) || 3306,
      user,
      password,
      database,
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
  // One-time visibility into what the pool will actually try to connect to —
  // helps confirm env vars (DB_SOCKET_PATH etc.) are really loaded at runtime.
  const { password: _password, ...safeConfig } = poolConfig as PoolConfig & { password?: string };
  console.log("[db] Prisma pool config:", safeConfig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(poolConfig as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always attach to global scope to avoid pool leaks in production
globalForPrisma.prisma = prisma;



