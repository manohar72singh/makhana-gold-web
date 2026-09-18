"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendSmsOtp } from "@/lib/sms";

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_REQUESTS_1_HOUR = 4;
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Request a 6-digit OTP for phone login.
 * Validates 10-digit Indian phone number, applies rate limiting (max 4 per hour + 60s cooldown),
 * checks if existing user has a name, and dispatches SMS.
 */
export async function requestPhoneOtpAction(
  rawPhone: string
): Promise<{
  success: boolean;
  isExisting?: boolean;
  hasName?: boolean;
  cooldownSeconds?: number;
  message?: string;
  error?: string;
}> {
  const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);

  // Validate 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      success: false,
      error: "Please enter a valid 10-digit Indian mobile number (e.g. 9835878575).",
    };
  }

  const formattedPhone = `+91${cleanPhone}`;

  try {
    // 1. Rate Limiting Check (Max 4 OTPs per 1 hour)
    const now = Date.now();
    const recentOtps = await prisma.otpVerification.findMany({
      where: {
        phone: formattedPhone,
        createdAt: {
          gte: new Date(now - ONE_HOUR_MS), // check within the last 1 hour
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check 1-hour quota (max 4 requests per hour)
    if (recentOtps.length >= MAX_REQUESTS_1_HOUR) {
      const oldestInWindow = recentOtps[recentOtps.length - 1];
      const elapsedSinceOldest = now - new Date(oldestInWindow.createdAt).getTime();
      const remainingMs = Math.max(0, ONE_HOUR_MS - elapsedSinceOldest);
      const waitMinutes = Math.ceil(remainingMs / 60000);

      return {
        success: false,
        cooldownSeconds: Math.ceil(remainingMs / 1000),
        error: `Aapne 1 ghante ki OTP limit (4 baar) poori kar li hai. Kripya ${waitMinutes} minute baad try karein.`,
      };
    }

    // Check 60-second cooldown between consecutive requests
    if (recentOtps.length > 0) {
      const lastRequestTime = new Date(recentOtps[0].createdAt).getTime();
      const elapsedSeconds = Math.floor((now - lastRequestTime) / 1000);
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        return {
          success: false,
          error: `Please wait ${remaining}s before requesting a new OTP.`,
          cooldownSeconds: remaining,
        };
      }
    }

    // 2. Check if customer already exists and has a real name
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: formattedPhone },
          { phone: cleanPhone },
          { phone: { contains: cleanPhone } },
        ],
      },
      select: { id: true, name: true },
    });

    const isExisting = Boolean(existingCustomer);
    const hasName = Boolean(
      existingCustomer?.name &&
        existingCustomer.name.trim().length > 0 &&
        !existingCustomer.name.startsWith("+91") &&
        !existingCustomer.name.replace(/\D/g, "").includes(cleanPhone)
    );

    // 3. Expire prior active unverified OTPs without deleting history (preserves rate-limit counts)
    await prisma.otpVerification.updateMany({
      where: {
        phone: formattedPhone,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        expiresAt: new Date(),
      },
    });

    // 4. Generate cryptographically random 6-digit OTP
    const code = String(crypto.randomInt(100000, 999999));
    const otpHash = await bcrypt.hash(code, 10);

    // 5. Store in database (expires in 5 minutes)
    await prisma.otpVerification.create({
      data: {
        phone: formattedPhone,
        otpHash,
        expiresAt: new Date(now + 5 * 60 * 1000),
      },
    });

    // 6. Send SMS via Gateway (Fast2SMS / Console fallback)
    const smsResult = await sendSmsOtp({
      phone: cleanPhone,
      otp: code,
    });

    if (!smsResult.success) {
      return {
        success: false,
        error: smsResult.error || "Failed to deliver OTP SMS. Please try again.",
      };
    }

    return {
      success: true,
      isExisting,
      hasName,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
    };
  } catch (err: any) {
    console.error("[requestPhoneOtpAction Error]", err);
    return {
      success: false,
      error: "Unable to send OTP at this time. Please try again later.",
    };
  }
}

/**
 * Validate OTP code before proceeding to Name entry (for new users).
 */
export async function validateOtpCodeAction(input: {
  phone: string;
  otp: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = input.phone.replace(/\D/g, "").slice(-10);
  const formattedPhone = `+91${cleanPhone}`;
  const otp = input.otp.trim();

  if (!otp || otp.length < 4) {
    return { success: false, error: "Please enter a valid OTP code." };
  }

  try {
    const record = await prisma.otpVerification.findFirst({
      where: {
        phone: formattedPhone,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return {
        success: false,
        error: "OTP has expired or is invalid. Please request a new one.",
      };
    }

    if (record.attempts >= record.maxAttempts) {
      return {
        success: false,
        error: "Too many incorrect attempts. Please request a new OTP.",
      };
    }

    const isDevTest =
      process.env.ALLOW_TEST_OTP === "true" &&
      (otp === "123456" || otp === "1234");
    const isMatch = isDevTest || (await bcrypt.compare(otp, record.otpHash));

    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      return { success: false, error: "Invalid OTP. Please check and try again." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[validateOtpCodeAction Error]", err);
    return { success: false, error: "Verification failed. Please try again." };
  }
}
