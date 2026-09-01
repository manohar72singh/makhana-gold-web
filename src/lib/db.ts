import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb as PrismaMySQLAdapter } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Clean & Standard MySQL Client for Prisma
 */
function createPrismaClient(): PrismaClient {
  let url = (process.env.DATABASE_URL || "mysql://root:123456@127.0.0.1:3306/makhana_gold").trim();

  // MySQL 8+ caching_sha2_password compatibility
  if (!url.includes("allowPublicKeyRetrieval")) {
    url += (url.includes("?") ? "&" : "?") + "allowPublicKeyRetrieval=true";
  }

  const adapter = new PrismaMySQLAdapter(url);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

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
