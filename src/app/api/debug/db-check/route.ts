import { NextResponse } from "next/server";
import mariadb from "mariadb";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint to surface the raw connection error instead
// of Prisma's generic "pool timeout" wrapper, while debugging production
// DB connectivity on Hostinger. Delete this route once the issue is fixed.
export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  let host = "unknown";
  let port = "unknown";
  try {
    const u = new URL(raw.replace("mysql://", "http://"));
    host = u.hostname;
    port = u.port || "3306";
  } catch {}

  const start = Date.now();
  try {
    const conn = await mariadb.createConnection({
      host,
      port: Number(port),
      user: raw.match(/mysql:\/\/([^:]+):/)?.[1],
      password: decodeURIComponent(raw.match(/:([^:@]+)@/)?.[1] || ""),
      database: raw.split("/").pop()?.split("?")[0],
      connectTimeout: 8000,
      allowPublicKeyRetrieval: true,
    });
    await conn.query("SELECT 1 as ok");
    await conn.end();
    return NextResponse.json({ ok: true, host, port, ms: Date.now() - start });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string; errno?: number; sqlState?: string };
    return NextResponse.json(
      {
        ok: false,
        host,
        port,
        ms: Date.now() - start,
        message: e?.message,
        code: e?.code,
        errno: e?.errno,
        sqlState: e?.sqlState,
      },
      { status: 500 }
    );
  }
}
