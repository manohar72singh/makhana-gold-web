import { NextResponse } from "next/server";
import mariadb from "mariadb";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint to surface the raw connection error instead
// of Prisma's generic "pool timeout" wrapper, while debugging production
// DB connectivity on Hostinger. Delete this route once the issue is fixed.
export async function GET() {
  const raw = (process.env.DATABASE_URL || "").trim();
  let host = "unknown";
  let port = "unknown";
  let parseError: string | undefined;
  try {
    const u = new URL(raw.replace("mysql://", "http://"));
    host = u.hostname;
    port = u.port || "3306";
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }

  const expected =
    "mysql://u440110284_makhanagold:Mg2026%23K7pQzX9vLwR3t@srv1953.hstgr.io:3306/u440110284_makhanagold";
  let firstDiffIndex = -1;
  for (let i = 0; i < Math.max(raw.length, expected.length); i++) {
    if (raw[i] !== expected[i]) {
      firstDiffIndex = i;
      break;
    }
  }

  const debug = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    urlLength: raw.length,
    expectedLength: expected.length,
    matchesExpected: raw === expected,
    firstDiffIndex,
    contextAroundDiff:
      firstDiffIndex >= 0
        ? {
            actual: JSON.stringify(raw.slice(Math.max(0, firstDiffIndex - 5), firstDiffIndex + 6)),
            expected: JSON.stringify(expected.slice(Math.max(0, firstDiffIndex - 5), firstDiffIndex + 6)),
          }
        : undefined,
    parseError,
  };

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
    return NextResponse.json({ ok: true, host, port, ms: Date.now() - start, debug });
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
        debug,
      },
      { status: 500 }
    );
  }
}
