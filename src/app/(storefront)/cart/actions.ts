"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { calculateTierPrice } from "@/lib/pricing";

export async function addToCartAction(formData: FormData) {
  const variantId = Number(formData.get("variantId"));
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));

  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
  const cart = await getOrCreateCart();

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const newTotalQty = (existingItem?.quantity ?? 0) + quantity;
  const effectivePrice = calculateTierPrice(Number(variant.price), newTotalQty);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: {
      quantity: { increment: quantity },
      priceAtAdd: effectivePrice,
    },
    create: {
      cartId: cart.id,
      variantId,
      quantity,
      priceAtAdd: effectivePrice,
    },
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
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });
    if (item && item.variant) {
      const effectivePrice = calculateTierPrice(Number(item.variant.price), quantity);
      await prisma.cartItem.update({
        where: { id: itemId, cartId: cart.id },
        data: { quantity, priceAtAdd: effectivePrice },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId, cartId: cart.id },
        data: { quantity },
      });
    }
  }

  revalidatePath("/", "layout");
}

export async function addBulkToCartAction(items: { variantId: number; quantity: number }[]) {
  const cart = await getOrCreateCart();
  const validItems = items.filter((i) => i.quantity > 0);
  if (validItems.length === 0) {
    throw new Error("Please select at least 1 packet to add to cart.");
  }

  const aggregateBulkQty = validItems.reduce((sum, i) => sum + i.quantity, 0);

  for (const item of validItems) {
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
    });
    const totalQty = (existing?.quantity ?? 0) + item.quantity;
    const tierBasisQty = Math.max(totalQty, aggregateBulkQty);
    const effectivePrice = calculateTierPrice(Number(variant.price), tierBasisQty);

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
      update: {
        quantity: { increment: item.quantity },
        priceAtAdd: effectivePrice,
      },
      create: {
        cartId: cart.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtAdd: effectivePrice,
      },
    });
  }

  revalidatePath("/", "layout");
  return { success: true, count: validItems.length };
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

