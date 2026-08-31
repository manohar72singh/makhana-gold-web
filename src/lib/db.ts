import fs from "fs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const COMMON_LINUX_SOCKETS = [
  "/var/run/mysqld/mysqld.sock",
  "/tmp/mysql.sock",
  "/var/lib/mysql/mysql.sock",
  "/var/run/mysql/mysql.sock",
];

function detectLinuxSocket(): string | undefined {
  if (typeof process === "undefined" || process.platform === "win32") return undefined;
  for (const socket of COMMON_LINUX_SOCKETS) {
    try {
      if (fs.existsSync(socket)) {
        return socket;
      }
    } catch {
      // ignore permission or access error
    }
  }
  return undefined;
}

/**
 * Intelligent Database Configuration Parser
 * Handles MySQL / MariaDB connection strings, Unix sockets, IPv4 resolution (preventing IPv6 localhost hang),
 * SSL certificates, and custom connection pool tuning for production scalability.
 */
function getPoolConfig(): PoolConfig {
  let rawUrl = (
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.DATABASE_URI ||
    "mysql://root:123456@127.0.0.1:3306/makhana_gold"
  ).trim();

  // Auto-repair malformed protocol if colon is missing (e.g. "mysql//..." -> "mysql://...")
  if (/^(mysql|mariadb)\/\//i.test(rawUrl)) {
    rawUrl = rawUrl.replace(/^(mysql|mariadb)\/\//i, "$1://");
  }

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

    // Socket path from explicit override, URL parameter, or auto-detected on Linux
    const detectedSocket = (host === "127.0.0.1" || host === "localhost") ? detectLinuxSocket() : undefined;
    const socketPath = explicitSocket || params.get("socket") || params.get("socketPath") || detectedSocket || undefined;

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

    // MySQL 8+ caching_sha2_password authentication compatibility
    const allowPublicKeyRetrievalParam = params.get("allowPublicKeyRetrieval") || params.get("allow_public_key_retrieval") || process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL;
    const allowPublicKeyRetrieval = allowPublicKeyRetrievalParam !== undefined ? allowPublicKeyRetrievalParam === "true" || allowPublicKeyRetrievalParam === "1" : true;

    const baseConfig: PoolConfig = {
      user,
      password,
      database,
      connectionLimit,
      connectTimeout,
      acquireTimeout,
      idleTimeout,
      allowPublicKeyRetrieval,
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
      allowPublicKeyRetrieval: true,
      ssl: false,
    };
  }
}

function createPrismaClient(): PrismaClient {
  const poolConfig = getPoolConfig();
  const { password: _password, ...safeConfig } = poolConfig as PoolConfig & { password?: string };
  
  // Log safe target configuration on both development and production for clear diagnostic visibility
  console.log("[db] Initialized MariaDB/MySQL pool target:", safeConfig);

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




