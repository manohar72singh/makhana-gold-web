import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-admin";

// Next.js 16 renamed `middleware.ts` -> `proxy.ts` (and the exported
// function to `proxy`). Route protection for the two independent auth
// scopes (customer vs admin) lives here, using next-auth/jwt's getToken
// directly rather than the auth() wrapper, since we run two separate
// NextAuth configs with different cookie names.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.AUTH_SECRET;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = await getToken({ req: request, secret, cookieName: ADMIN_SESSION_COOKIE });
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (
    (pathname.startsWith("/account") || pathname.startsWith("/checkout")) &&
    pathname !== "/login"
  ) {
    const token = await getToken({ req: request, secret });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
