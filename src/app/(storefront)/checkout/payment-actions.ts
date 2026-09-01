"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  isRazorpayConfigured,
} from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;

export async function initiateOnlineOrderAction(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) {
    throw new Error("Authentication required to proceed to payment.");
  }

  const cart = await getCartWithItems();
  if (cart.items.length === 0) {
    throw new Error("Your bag is empty.");
  }

  const contactName = String(formData.get("name") || "").trim();
  const contactPhone = String(formData.get("phone") || "").trim();

  if (contactName || contactPhone) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: contactName || undefined,
        phone: contactPhone || undefined,
      },
    });
  }

  const savedAddressId = formData.get("savedAddressId")
    ? Number(formData.get("savedAddressId"))
    : null;

  let addressId: number;

  if (savedAddressId) {
    const existingAddress = await prisma.address.findFirst({
      where: { id: savedAddressId, customerId },
    });
    if (!existingAddress) throw new Error("Invalid address selected");
    addressId = existingAddress.id;
  } else {
    const saveToProfile = formData.get("saveToProfile") === "on";
    const label = String(formData.get("addressLabel") || "Home");
    const line1 = String(formData.get("line1") || "");
    const line2 = String(formData.get("landmark") || "") || null;
    const city = String(formData.get("city") || "");
    const state = String(formData.get("state") || "");
    const pincode = String(formData.get("pincode") || "");

    const newAddress = await prisma.address.create({
      data: {
        customerId,
        label: saveToProfile ? label : "Checkout Address",
        line1,
        line2,
        city,
        state,
        pincode,
        isDefaultShipping: saveToProfile,
      },
    });
    addressId = newAddress.id;
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
    0
  );

  const couponCode = String(formData.get("couponCode") || "").toUpperCase().trim();
  let couponId: number | null = null;
  let discountTotal = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue))) {
      couponId = coupon.id;
      discountTotal = coupon.type === "percent"
        ? (subtotal * Number(coupon.value)) / 100
        : Math.min(Number(coupon.value), subtotal);
      discountTotal = Math.round(discountTotal * 100) / 100;

      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const couponDiscount = discountTotal;
  // 5% Extra Instant Discount for Online UPI / Card Payments (Anti-RTO Incentive)
  const prepaidDiscount = Math.round((subtotal * 0.05) * 100) / 100;
  const combinedDiscount = Math.round((couponDiscount + prepaidDiscount) * 100) / 100;

  const discountedSubtotal = Math.max(0, subtotal - combinedDiscount);
  const isFreeShipCoupon = couponCode === "FREESHIP";
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShipCoupon ? 0 : SHIPPING_FEE;
  const tax = discountedSubtotal * TAX_RATE;
  const grandTotal = discountedSubtotal + shipping + tax;

  const orderNumber = `MG-${8000 + (await prisma.order.count()) + 1}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      status: "pending",
      subtotal,
      discountTotal: combinedDiscount,
      couponId,
      shippingTotal: shipping,
      taxTotal: tax,
      grandTotal,
      shippingAddressId: addressId,
      billingAddressId: addressId,
      paymentStatus: "pending",
      items: {
        create: await Promise.all(
          cart.items.map(async (item) => {
            const variant = await prisma.productVariant.findUniqueOrThrow({
              where: { id: item.variantId },
              include: { product: true },
            });
            return {
              variantId: item.variantId,
              productName: variant.product.name,
              variantName: variant.packSize,
              quantity: item.quantity,
              unitPrice: item.priceAtAdd,
              lineTotal: Number(item.priceAtAdd) * item.quantity,
            };
          })
        ),
      },
      statusHistory: {
        create: { status: "pending", note: "Online payment initiated via Razorpay." },
      },
    },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
    },
  });

  // Create Razorpay Order
  const amountPaise = Math.round(grandTotal * 100);
  const rzpOrder = await createRazorpayOrder({
    amountPaise,
    receipt: order.orderNumber,
    notes: {
      orderId: String(order.id),
      orderNumber: order.orderNumber,
      customerEmail: order.customer.email,
    },
  });

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzpOrder.id,
    amountPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    isConfigured: isRazorpayConfigured(),
    customer: {
      name: order.customer.name || contactName || "Valued Customer",
      email: order.customer.email,
      phone: order.customer.phone || contactPhone || "+919876543210",
    },
  };
}

export async function verifyAndCompletePaymentAction({
  orderId,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
}: {
  orderId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  const isValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isValid) {
    throw new Error("Payment signature verification failed. Please contact support.");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "confirmed",
      paymentStatus: "paid",
      paymentReference: razorpayPaymentId,
      statusHistory: {
        create: {
          status: "confirmed",
          note: `Payment successfully captured via Razorpay. Txn ID: ${razorpayPaymentId}`,
        },
      },
    },
    include: {
      customer: true,
      items: true,
      shippingAddress: true,
    },
  });

  // Clear customer cart
  const cart = await prisma.cart.findFirst({
    where: { customerId: order.customerId, status: "active" },
  });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: "converted" },
    });
  }

  // Send automated order confirmation email for online paid orders
  if (order.customer?.email && order.shippingAddress) {
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customer.name || "Valued Customer",
        customerEmail: order.customer.email,
        items: order.items.map((i) => ({
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          lineTotal: Number(i.lineTotal),
        })),
        subtotal: Number(order.subtotal),
        discountTotal: Number(order.discountTotal),
        shippingTotal: Number(order.shippingTotal),
        taxTotal: Number(order.taxTotal),
        grandTotal: Number(order.grandTotal),
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        shippingAddress: {
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.pincode,
        },
      });
    } catch (e) {
      console.error("Online paid order confirmation email error:", e);
    }
  }

  revalidatePath(`/checkout/confirmed/${order.orderNumber}`);
  return {
    success: true,
    orderNumber: order.orderNumber,
  };
}
