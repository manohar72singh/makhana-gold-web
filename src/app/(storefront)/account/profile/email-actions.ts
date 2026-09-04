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
  let merged = false;

  await prisma.$transaction(async (tx) => {
    const otherCustomer = await tx.customer.findUnique({ where: { email: verifiedEmail } });

    if (otherCustomer && otherCustomer.id !== customerId) {
      merged = true;
      const oldId = otherCustomer.id;

      // Simple reassignments — no unique constraints to collide with.
      await tx.address.updateMany({ where: { customerId: oldId }, data: { customerId } });
      await tx.order.updateMany({ where: { customerId: oldId }, data: { customerId } });
      await tx.review.updateMany({ where: { customerId: oldId }, data: { customerId } });

      // Wishlist has a unique (customerId, variantId) pair — drop the
      // duplicate rather than reassigning it if both accounts wishlisted
      // the same variant.
      const oldWishlists = await tx.wishlist.findMany({ where: { customerId: oldId } });
      for (const item of oldWishlists) {
        const existing = await tx.wishlist.findUnique({
          where: { customerId_variantId: { customerId, variantId: item.variantId } },
        });
        if (existing) {
          await tx.wishlist.delete({ where: { id: item.id } });
        } else {
          await tx.wishlist.update({ where: { id: item.id }, data: { customerId } });
        }
      }

      // Carts: fold the old account's active cart items into the current
      // active cart (merging quantities); reassign any historical carts as-is.
      const oldCarts = await tx.cart.findMany({
        where: { customerId: oldId },
        include: { items: true },
      });
      for (const oldCart of oldCarts) {
        if (oldCart.status !== "active") {
          await tx.cart.update({ where: { id: oldCart.id }, data: { customerId } });
          continue;
        }

        let activeCart = await tx.cart.findFirst({ where: { customerId, status: "active" } });
        if (!activeCart) {
          activeCart = await tx.cart.create({ data: { customerId, status: "active" } });
        }

        for (const item of oldCart.items) {
          const existingItem = await tx.cartItem.findUnique({
            where: { cartId_variantId: { cartId: activeCart.id, variantId: item.variantId } },
          });
          if (existingItem) {
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + item.quantity },
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: activeCart.id,
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtAdd: item.priceAtAdd,
              },
            });
          }
        }
        await tx.cartItem.deleteMany({ where: { cartId: oldCart.id } });
        await tx.cart.delete({ where: { id: oldCart.id } });
      }

      // Carry over a phone number / password the current row is missing.
      await tx.customer.update({
        where: { id: customerId },
        data: {
          phone: customer.phone ?? otherCustomer.phone ?? undefined,
          passwordHash: customer.passwordHash ?? otherCustomer.passwordHash ?? undefined,
        },
      });

      // Free up the email before claiming it below.
      await tx.customer.delete({ where: { id: oldId } });
    }

    await tx.customer.update({
      where: { id: customerId },
      data: {
        email: verifiedEmail,
        emailVerifiedAt: new Date(),
        pendingEmail: null,
        pendingEmailOtpHash: null,
        pendingEmailOtpExpiresAt: null,
      },
    });
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  revalidatePath("/checkout");

  return { success: true, merged };
}
