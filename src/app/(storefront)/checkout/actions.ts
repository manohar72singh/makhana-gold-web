"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isPlaceholderEmail } from "@/lib/phone-email";
import { notifyAdmins } from "@/lib/admin-notifications";

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;

export async function placeOrderAction(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) redirect("/login?callbackUrl=/checkout");

  const customerRecord = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { email: true },
  });
  if (customerRecord && isPlaceholderEmail(customerRecord.email)) {
    redirect("/account/profile?verifyEmail=1&callbackUrl=/checkout");
  }

  const cart = await getCartWithItems();
  if (cart.items.length === 0) redirect("/cart");

  const contactName = String(formData.get("name") || "").trim();
  const contactPhone = String(formData.get("phone") || "").trim();

  if (!contactName) {
    throw new Error("Full Name is mandatory for delivery.");
  }
  const digitsOnlyPhone = contactPhone.replace(/\D/g, "");
  if (!digitsOnlyPhone || digitsOnlyPhone.length < 10) {
    throw new Error("A valid 10-digit mobile number is mandatory for delivery.");
  }

  // Always update customer name and phone
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: contactName,
      phone: contactPhone,
    },
  });

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
    const label = String(formData.get("label") || "Home").trim();
    const line1 = String(formData.get("line1") || "").trim();
    const line2 = String(formData.get("line2") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const state = String(formData.get("state") || "").trim();
    const pincode = String(formData.get("pincode") || "").trim();

    if (!line1) {
      throw new Error("Street Address / Flat / Building is mandatory.");
    }
    if (!line2) {
      throw new Error("Landmark / Area / Colony is mandatory.");
    }
    if (!city) {
      throw new Error("City is mandatory.");
    }
    if (!state) {
      throw new Error("State is mandatory.");
    }
    if (!pincode || pincode.length !== 6) {
      throw new Error("A valid 6-digit PIN code is mandatory.");
    }

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

  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const isFreeShipCoupon = couponCode === "FREESHIP";
  const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShipCoupon) ? 0 : SHIPPING_FEE;
  const tax = discountedSubtotal * TAX_RATE;
  const grandTotal = discountedSubtotal + shipping + tax;

  const orderNumber = `MG-${8000 + (await prisma.order.count()) + 1}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      status: "confirmed",
      subtotal,
      discountTotal,
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
        create: { status: "confirmed", note: "Order placed by customer." },
      },
    },
    include: {
      items: true,
      shippingAddress: true,
      customer: true,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id! } });
  await prisma.cart.update({ where: { id: cart.id! }, data: { status: "converted" } });

  await notifyAdmins({
    type: "new_order",
    title: `New order #${order.orderNumber}`,
    message: `₹${grandTotal.toFixed(2)} — ${order.customer?.name || contactName || "Guest"}`,
    link: `/admin/orders/${order.orderNumber}`,
  });

  // Send automated luxury order confirmation email
  if (order.customer?.email && order.shippingAddress) {
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customer.name || contactName || "Valued Customer",
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
      console.error("Order confirmation email error:", e);
    }
  }

  redirect(`/checkout/confirmed/${order.orderNumber}`);
}
