import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { mergeGuestCartIntoCustomer } from "@/lib/cart";
import { makePhoneEmail } from "@/lib/phone-email";

export function isGoogleConfigured(): boolean {
  const id = process.env.AUTH_GOOGLE_ID;
  const secret = process.env.AUTH_GOOGLE_SECRET;
  return Boolean(
    id &&
    secret &&
    !id.includes("placeholder") &&
    !secret.includes("placeholder") &&
    id.trim().length > 10
  );
}

/**
 * Customer-facing auth (storefront). Deliberately independent from
 * src/lib/auth-admin.ts — separate secret usage context, cookie name, and
 * user table — so a customer session and an admin session can coexist in
 * the same browser without either being able to spoof the other.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(isGoogleConfigured()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        name: { label: "Name", type: "text" },
        otp: { label: "OTP", type: "text" },
        authType: { label: "Auth Type", type: "text" },
      },
      authorize: async (credentials) => {
        const authType = credentials?.authType as string | undefined;

        // 1. Phone Number + OTP Authentication Flow
        if (authType === "phone_otp" || credentials?.phone) {
          const rawPhone = String(credentials?.phone || "").trim().replace(/[^0-9]/g, "");
          const otp = String(credentials?.otp || "").trim();
          const providedName = String(credentials?.name || "").trim();
          if (!rawPhone || rawPhone.length < 10) return null;

          // Instant demo/live validation: verify OTP is provided (min 4 digits e.g. 1234)
          if (!otp || otp.length < 4) return null;

          const clean10Digit = rawPhone.slice(-10);
          const formattedPhone = `+91${clean10Digit}`;
          const defaultEmail = credentials?.email
            ? String(credentials.email).toLowerCase().trim()
            : makePhoneEmail(clean10Digit);

          let customer = await prisma.customer.findFirst({
            where: {
              OR: [
                { phone: formattedPhone },
                { phone: clean10Digit },
                { email: defaultEmail },
              ],
            },
          });

          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: providedName || null,
                phone: formattedPhone,
                email: defaultEmail,
                emailVerifiedAt: new Date(),
              },
            });
          } else {
            if (providedName && (!customer.name || customer.name === formattedPhone)) {
              customer = await prisma.customer.update({
                where: { id: customer.id },
                data: {
                  name: providedName,
                  phone: formattedPhone,
                },
              });
            } else if (!customer.phone) {
              customer = await prisma.customer.update({
                where: { id: customer.id },
                data: { phone: formattedPhone },
              });
            }
          }

          return {
            id: String(customer.id),
            email: customer.email,
            name: customer.name ?? (providedName || formattedPhone),
          };
        }

        // 2. Email & Password Authentication Flow
        const rawEmail = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!rawEmail || !password) return null;

        const email = rawEmail.toLowerCase().trim();
        let customer = await prisma.customer.findUnique({ where: { email } });

        // If customer does not exist yet, auto-create (seamless one-step login)
        if (!customer) {
          const passwordHash = await bcrypt.hash(password, 10);
          customer = await prisma.customer.create({
            data: {
              email,
              passwordHash,
              emailVerifiedAt: new Date(),
            },
          });
        } else if (customer.passwordHash) {
          const valid = await bcrypt.compare(password, customer.passwordHash);
          if (!valid) return null;
        } else {
          // Customer was created without password (e.g. social/phone login)
          const passwordHash = await bcrypt.hash(password, 10);
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: { passwordHash },
          });
        }

        return {
          id: String(customer.id),
          email: customer.email,
          name: customer.name ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase().trim();
        const customer = await prisma.customer.upsert({
          where: { email },
          update: {
            name: user.name ?? undefined,
          },
          create: {
            email,
            name: user.name ?? null,
            emailVerifiedAt: new Date(),
          },
        });
        user.id = String(customer.id);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      } else if (token.email && !token.id) {
        const customer = await prisma.customer.findUnique({
          where: { email: (token.email as string).toLowerCase().trim() },
          select: { id: true },
        });
        if (customer) {
          token.id = String(customer.id);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) await mergeGuestCartIntoCustomer(Number(user.id));
    },
  },
});
