"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isShiprocketConfigured, pushOrderToShiprocket, assignShiprocketAwb } from "@/lib/shiprocket";
import { generateAwbTrackingDetails } from "@/lib/logistics";
import { sendShippingDispatchEmail } from "@/lib/email";
import { sendOrderDispatchSms } from "@/lib/sms";
import { adminAuth } from "@/lib/auth-admin";

export async function dispatchOrderAwbAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const courier = String(formData.get("courier") || "Delhivery Express Surface");
  const customAwb = String(formData.get("customAwb") || "").trim();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      shippingAddress: true,
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const customerName = order.customer.name || "Valued Customer";
  const customerEmail = order.customer.email;
  const customerPhone = order.customer.phone;

  let trackingNumber = customAwb;
  let courierPartner = courier;
  let trackingUrl = "";

  // 1. If Shiprocket is explicitly chosen and configured, try auto-push
  if (!customAwb && courier.toLowerCase().includes("shiprocket") && isShiprocketConfigured()) {
    try {
      const shiprocketRes = await pushOrderToShiprocket({
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "9999999999",
        addressLine1: order.shippingAddress?.line1 || "Customer Address",
        addressLine2: order.shippingAddress?.line2,
        city: order.shippingAddress?.city || "New Delhi",
        state: order.shippingAddress?.state || "Delhi",
        pincode: order.shippingAddress?.pincode || "110001",
        totalAmount: Number(order.grandTotal),
        paymentMethod: order.paymentStatus === "paid" ? "prepaid" : "cod",
        items: order.items.map((it) => ({
          name: it.productName || "Makhana Gold Roast",
          sku: it.variant?.sku || `SKU-${it.id}`,
          quantity: it.quantity,
          price: Number(it.unitPrice),
        })),
      });

      const awbRes = await assignShiprocketAwb({
        shipmentId: shiprocketRes.shipmentId,
        courierName: courier,
      });

      trackingNumber = awbRes.awbCode;
      courierPartner = awbRes.courierPartner || courier;
      trackingUrl = awbRes.trackingUrl;
    } catch (e) {
      console.warn("Shiprocket auto-push fallback to carrier simulation:", e);
    }
  }

  // 2. Direct Courier / Fallback Logistics
  if (!trackingNumber) {
    const logistics = generateAwbTrackingDetails(order.orderNumber, courier, customAwb);
    trackingNumber = logistics.trackingNumber;
    courierPartner = logistics.courierPartner;
    trackingUrl = logistics.trackingUrl;
  }

  // 3. Update Database Record
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "shipped",
      trackingNumber,
      courierPartner,
      trackingUrl,
      statusHistory: {
        create: {
          status: "shipped",
          note: `Handed over to ${courierPartner}. AWB Tracking Number: ${trackingNumber}`,
          changedByAdminId: adminId,
        },
      },
    },
  });

  // 4. Send Automated Dispatch Email to Customer
  if (customerEmail && !customerEmail.includes("placeholder") && !customerEmail.includes("@phone.")) {
    try {
      await sendShippingDispatchEmail({
        to: customerEmail,
        customerName,
        orderNumber: order.orderNumber,
        courierPartner,
        trackingNumber,
        trackingUrl,
      });
    } catch (emailErr) {
      console.warn("Failed to send shipping email:", emailErr);
    }
  }

  // 5. Send Automated Dispatch SMS to Customer Phone
  if (customerPhone) {
    try {
      await sendOrderDispatchSms({
        phone: customerPhone,
        orderNumber: order.orderNumber,
        courierPartner,
        trackingNumber,
        trackingUrl,
      });
    } catch (smsErr) {
      console.warn("Failed to send shipping SMS:", smsErr);
    }
  }

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath(`/checkout/confirmed/${order.orderNumber}`);
  revalidatePath(`/track`);
}

export async function markOrderProcessingAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "processing" },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: "processing",
      note: "Package is being slow-roasted, weighed, and sealed for dispatch at Mithila facility.",
      changedByAdminId: adminId,
    },
  });

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/track");
}

export async function markOrderDeliveredAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "delivered",
      paymentStatus: "paid", // If COD, mark paid upon successful delivery
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: "delivered",
      note: "Shipment successfully handed over to customer. Order complete.",
      changedByAdminId: adminId,
    },
  });

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/track");
}
