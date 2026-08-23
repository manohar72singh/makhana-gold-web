import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "admin-session-token";

/**
 * Admin-panel auth. A second, fully independent NextAuth instance (own
 * basePath + cookie name) against `admin_users`, kept separate from
 * src/lib/auth.ts (customer auth against `customers`) per the two-session-
 * scope design in the build plan.
 */
export const {
  handlers: adminHandlers,
  auth: adminAuth,
  signIn: adminSignIn,
  signOut: adminSignOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  basePath: "/api/admin/auth",
  pages: {
    signIn: "/admin/login",
  },
  cookies: {
    sessionToken: {
      name: ADMIN_SESSION_COOKIE,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email },
          include: { role: true },
        });
        if (!admin || !admin.isActive) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name,
          role: admin.role.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
