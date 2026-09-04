import { NextResponse } from "next/server";
import { connect } from "net";
import mariadb from "mariadb";

// TEMPORARY diagnostic route — delete once the production DB connectivity
// issue is resolved. Bypasses Prisma's pool entirely so we can see the raw
// TCP/driver-level error instead of Prisma's generic "pool timeout".
export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)/);
  if (!match) {
    return NextResponse.json({ error: "DATABASE_URL missing or unparseable" }, { status: 500 });
  }
  const [, user, , host, portStr, database] = match;
  const port = Number(portStr);

  const result: Record<string, unknown> = { host, port, database, user };

  // 1. Raw TCP connect test (no auth, no query — just "can we open a socket")
  const tcpStart = Date.now();
  result.tcp = await new Promise((resolve) => {
    const socket = connect({ host, port, timeout: 8000 });
    socket.on("connect", () => {
      socket.destroy();
      resolve({ ok: true, ms: Date.now() - tcpStart });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ok: false, error: "timeout (connection attempt hung, likely firewalled/dropped)", ms: Date.now() - tcpStart });
    });
    socket.on("error", (err) => {
      resolve({ ok: false, error: err.message, code: (err as NodeJS.ErrnoException).code, ms: Date.now() - tcpStart });
    });
  });

  // 2. Real MariaDB driver connection + auth + query, short timeout
  const dbStart = Date.now();
  try {
    const conn = await mariadb.createConnection({
      host,
      port,
      user,
      password: decodeURIComponent(match[2]),
      database,
      connectTimeout: 8000,
      allowPublicKeyRetrieval: true,
    });
    const rows = await conn.query("SELECT 1 AS ok");
    await conn.end();
    result.mariadb = { ok: true, ms: Date.now() - dbStart, rows: JSON.parse(JSON.stringify(rows)) };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { code?: string; sqlMessage?: string };
    result.mariadb = {
      ok: false,
      ms: Date.now() - dbStart,
      message: e.message,
      code: e.code,
      sqlMessage: e.sqlMessage,
    };
  }

  return NextResponse.json(result);
}
