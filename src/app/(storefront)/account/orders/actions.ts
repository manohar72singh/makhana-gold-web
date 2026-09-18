"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { notifyAdmins } from "@/lib/admin-notifications";

/**
 * 1-Click Re-Order: Takes all active items from a past order,
 * adds them into the customer's current cart, and returns success.
 */
export async function reorderAction(orderId: number) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) {
    throw new Error("Please log in to re-order your favorite foxnuts.");
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order || order.items.length === 0) {
    throw new Error("Order not found or contains no re-orderable items.");
  }

  const cart = await getOrCreateCart();

  let addedCount = 0;
  for (const item of order.items) {
    // Verify variant still exists and product is active
    if (item.variant && item.variant.product.status === "active") {
      await prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: item.variantId,
          },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          cartId: cart.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtAdd: item.variant.price,
        },
      });
      addedCount++;
    }
  }

  if (addedCount === 0) {
    throw new Error("The products from this order are currently out of stock or archived.");
  }

  revalidatePath("/cart");
  revalidatePath("/account/orders");

  return { success: true, addedCount };
}

/**
 * Pre-Dispatch Order Cancellation (Strictly Before Packing):
 * Orders can ONLY be cancelled while in 'pending' or 'confirmed' status.
 * Under FSSAI Food Safety Regulations, consumable food items cannot
 * be cancelled once dispatched or packed for hygiene reasons.
 */
export async function cancelOrderAction(orderNumber: string, reason?: string) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Strict FSSAI pre-dispatch check
  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new Error(
      "This order has already been processed/dispatched for delivery. Under FSSAI food safety regulations, consumable gourmet products cannot be cancelled once packed."
    );
  }

  const cancellationNote = reason?.trim()
    ? `Cancelled by customer before dispatch. Reason: ${reason.trim()}`
    : "Cancelled by customer before dispatch.";

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled",
        ...(order.paymentStatus === "paid" ? { paymentStatus: "refunded" } : {}),
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "cancelled",
        note: cancellationNote,
      },
    }),
  ]);

  await notifyAdmins({
    type: "payment_failed",
    title: `Order #${order.orderNumber} Cancelled`,
    message: `Customer cancelled order before packing. ${reason ? `Reason: ${reason}` : ""}`,
    link: `/admin/orders/${order.orderNumber}`,
  });

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderNumber}`);
  revalidatePath(`/checkout/confirmed/${orderNumber}`);

  return { success: true };
}
