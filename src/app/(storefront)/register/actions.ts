"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 8) {
    redirect("/register?error=InvalidInput");
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=EmailTaken");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.customer.create({ data: { name, email, passwordHash } });

  await signIn("credentials", { email, password, redirectTo: "/account" });
}
