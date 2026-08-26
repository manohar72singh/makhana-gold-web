import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Intelligent Database Configuration Parser
 * Handles MySQL / MariaDB connection strings, Unix sockets, IPv4 resolution (preventing IPv6 localhost hang),
 * SSL certificates, and custom connection pool tuning for production scalability.
 */
function getPoolConfig(): PoolConfig {
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.DATABASE_URI ||
    "mysql://root:123456@127.0.0.1:3306/makhana_gold";

  // Explicit socket path override (e.g. Hostinger / cPanel / Docker: /var/run/mysqld/mysqld.sock)
  const explicitSocket = process.env.DB_SOCKET_PATH;

  try {
    const parsed = new URL(rawUrl);
    const params = parsed.searchParams;

    // Resolve Host: Convert "localhost" to "127.0.0.1" to eliminate Node.js IPv6 (::1) lookup hangs on Linux/Windows
    let host = parsed.hostname || "127.0.0.1";
    if (host.toLowerCase() === "localhost") {
      host = "127.0.0.1";
    }
    if (process.env.DB_HOST) {
      host = process.env.DB_HOST;
    }

    const port = Number(process.env.DB_PORT || parsed.port) || 3306;
    const user = decodeURIComponent(process.env.DB_USER || parsed.username || "root");
    const password = decodeURIComponent(process.env.DB_PASSWORD || parsed.password || "");
    const database = (process.env.DB_NAME || parsed.pathname.replace(/^\//, "") || "makhana_gold").split("?")[0];

    // Socket path from URL parameter or env
    const socketPath = explicitSocket || params.get("socket") || params.get("socketPath") || undefined;

    // Connection limits & timeouts
    const connectionLimit = Number(
      process.env.DB_CONNECTION_LIMIT ||
      params.get("connection_limit") ||
      params.get("connectionLimit") ||
      params.get("pool_limit") ||
      15 // Tuned for concurrent SSR + background revalidation
    );

    const connectTimeout = Number(
      process.env.DB_CONNECT_TIMEOUT ||
      params.get("connect_timeout") ||
      params.get("connectTimeout") ||
      15000 // 15s to allow for cloud network latency
    );

    const acquireTimeout = Number(
      process.env.DB_ACQUIRE_TIMEOUT ||
      params.get("acquire_timeout") ||
      params.get("acquireTimeout") ||
      params.get("pool_timeout") ||
      15000 // 15s pool acquisition timeout
    );

    const idleTimeout = Number(
      process.env.DB_IDLE_TIMEOUT ||
      params.get("idle_timeout") ||
      params.get("idleTimeout") ||
      60000 // 60s idle connection timeout
    );

    // SSL configuration
    const sslParam = (params.get("ssl") || params.get("sslmode") || process.env.DB_SSL || "").toLowerCase();
    const isSsl = sslParam === "true" || sslParam === "require" || sslParam === "prefer" || sslParam === "1";

    const baseConfig: PoolConfig = {
      user,
      password,
      database,
      connectionLimit,
      connectTimeout,
      acquireTimeout,
      idleTimeout,
      minDelayValidation: 500,
      allowPublicKeyRetrieval: true,
      compress: host !== "127.0.0.1", // Compress traffic for remote database connections
      ssl: isSsl ? { rejectUnauthorized: false } : false,
    };

    if (socketPath) {
      return {
        ...baseConfig,
        socketPath,
      };
    }

    return {
      ...baseConfig,
      host,
      port,
    };
  } catch (err) {
    console.error("[db] Error parsing DATABASE_URL, falling back to 127.0.0.1 default:", err);
    return {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "makhana_gold",
      connectionLimit: 15,
      connectTimeout: 15000,
      acquireTimeout: 15000,
      idleTimeout: 60000,
      minDelayValidation: 500,
      allowPublicKeyRetrieval: true,
      ssl: false,
    };
  }
}

function createPrismaClient(): PrismaClient {
  const poolConfig = getPoolConfig();
  const { password: _password, ...safeConfig } = poolConfig as PoolConfig & { password?: string };
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[db] Initialized MariaDB/MySQL connection pool:", safeConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(poolConfig as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always attach to global scope to prevent connection pool leaks across Next.js worker threads and HMR
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

/**
 * Health check helper to verify database connectivity
 */
export async function checkDatabaseHealth(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err?.message || "Unknown error" };
  }
}




