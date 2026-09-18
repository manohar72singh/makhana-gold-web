"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { isPlaceholderEmail } from "@/lib/phone-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 10 * 60 * 1000;

async function requireCustomerId() {
  const session = await auth();
  const id = session?.user?.id ? Number(session.user.id) : null;
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function requestEmailOtpAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const customerId = await requireCustomerId();
  const email = String(formData.get("email") || "").toLowerCase().trim();

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (isPlaceholderEmail(email)) {
    return { success: false, error: "Please enter your real email address." };
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { success: false, error: "Account not found." };
  if (email === customer.email.toLowerCase()) {
    return { success: false, error: "This is already your account email." };
  }

  // Strictly block if this email already belongs to another registered customer
  const existingOtherCustomer = await prisma.customer.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingOtherCustomer && existingOtherCustomer.id !== customerId) {
    return {
      success: false,
      error: "This email is already registered with another account. Please use a different email or log in with that account.",
    };
  }

  const code = String(crypto.randomInt(100000, 999999));
  const otpHash = await bcrypt.hash(code, 10);

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      pendingEmail: email,
      pendingEmailOtpHash: otpHash,
      pendingEmailOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const result = await sendOtpEmail({ to: email, code, customerName: customer.name });
  if (!result.success) {
    return { success: false, error: "Couldn't send the verification email. Please try again." };
  }

  return { success: true };
}

export async function verifyEmailOtpAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; merged?: boolean }> {
  const customerId = await requireCustomerId();
  const code = String(formData.get("code") || "").trim();

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer?.pendingEmail || !customer.pendingEmailOtpHash || !customer.pendingEmailOtpExpiresAt) {
    return { success: false, error: "No pending verification found. Please request a new code." };
  }
  if (customer.pendingEmailOtpExpiresAt < new Date()) {
    return { success: false, error: "This code has expired. Please request a new one." };
  }

  const isValid = await bcrypt.compare(code, customer.pendingEmailOtpHash);
  if (!isValid) {
    return { success: false, error: "Incorrect code. Please check and try again." };
  }

  const verifiedEmail = customer.pendingEmail;
  const otherCustomer = await prisma.customer.findUnique({ where: { email: verifiedEmail } });
  if (otherCustomer && otherCustomer.id !== customerId) {
    return {
      success: false,
      error: "This email is already registered with another account. Please use a different email or log in with that account.",
    };
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      email: verifiedEmail,
      emailVerifiedAt: new Date(),
      pendingEmail: null,
      pendingEmailOtpHash: null,
      pendingEmailOtpExpiresAt: null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  revalidatePath("/checkout");

  return { success: true, merged: false };
}
