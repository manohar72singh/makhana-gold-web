"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";

export async function addToCartAction(formData: FormData) {
  const variantId = Number(formData.get("variantId"));
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));

  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
  const cart = await getOrCreateCart();

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity, priceAtAdd: variant.price },
  });

  revalidatePath("/", "layout");
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));
  const cart = await getOrCreateCart();

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId, cartId: cart.id } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId, cartId: cart.id }, data: { quantity } });
  }

  revalidatePath("/", "layout");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const cart = await getOrCreateCart();
  await prisma.cartItem.delete({ where: { id: itemId, cartId: cart.id } });
  revalidatePath("/", "layout");
}

export async function validateCouponAction(code: string, subtotal: number) {
  if (!code) return { success: false, error: "Please enter a coupon code" };
  const normalizedCode = code.toUpperCase().trim();

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon || !coupon.isActive) {
    return { success: false, error: "Invalid or inactive coupon code" };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { success: false, error: "This coupon is not active yet" };
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { success: false, error: "This coupon has expired" };
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, error: "Coupon usage limit reached" };
  }

  const minOrder = Number(coupon.minOrderValue);
  if (subtotal < minOrder) {
    return {
      success: false,
      error: `Minimum order of ₹${minOrder} required for code ${coupon.code}`,
    };
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = (subtotal * Number(coupon.value)) / 100;
  } else if (coupon.type === "fixed") {
    discount = Math.min(Number(coupon.value), subtotal);
  }

  return {
    success: true,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discount: Math.round(discount * 100) / 100,
    message:
      coupon.type === "percent"
        ? `${Number(coupon.value)}% discount applied!`
        : `₹${Number(coupon.value)} discount applied!`,
  };
}

