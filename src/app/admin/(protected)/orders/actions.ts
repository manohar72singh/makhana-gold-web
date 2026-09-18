"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { adminAuth } from "@/lib/auth-admin";
import { generateAwbTrackingDetails } from "@/lib/logistics";
import { sendShippingDispatchEmail } from "@/lib/email";
import { sendOrderDispatchSms } from "@/lib/sms";
import { isShiprocketConfigured, pushOrderToShiprocket, assignShiprocketAwb } from "@/lib/shiprocket";

export async function updateOrderStatusAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));
  const status = String(formData.get("status")) as
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  const note = String(formData.get("note") || "");

  // If status is delivered and order is COD, automatically mark payment paid
  const updateData: Record<string, unknown> = { status };
  if (status === "delivered") {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true },
    });
    if (currentOrder && currentOrder.paymentStatus !== "paid") {
      updateData.paymentStatus = "paid";
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: updateData });
  await prisma.orderStatusHistory.create({
    data: { orderId, status, note: note || null, changedByAdminId: adminId },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/fulfillment");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/track`);
  revalidatePath(`/account/orders/${orderNumber}`);
}

export async function markOrderProcessingAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "processing",
      statusHistory: {
        create: {
          status: "processing",
          note: "Box packed, quality checked, and moved to courier pickup station.",
          changedByAdminId: adminId,
        },
      },
    },
  });

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/track`);
  revalidatePath(`/account/orders/${orderNumber}`);
}

export async function markOrderDeliveredAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });

  const shouldMarkPaid = order && order.paymentStatus !== "paid";

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "delivered",
      ...(shouldMarkPaid ? { paymentStatus: "paid" } : {}),
      statusHistory: {
        create: {
          status: "delivered",
          note: "Consignment safely delivered to customer doorstep." + (shouldMarkPaid ? " (COD Collected & Marked Paid)" : ""),
          changedByAdminId: adminId,
        },
      },
    },
  });

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/track`);
  revalidatePath(`/account/orders/${orderNumber}`);
}

export async function dispatchCourierOrderAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));
  const courierPartner = String(formData.get("courierPartner") || "Delhivery Express Surface");
  let trackingNumber = String(formData.get("trackingNumber") || "").trim();

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

  let trackingUrl = "";
  let finalCourier = courierPartner;

  // 1. Shiprocket Auto-push if configured and chosen without manual AWB
  if (!trackingNumber && courierPartner.toLowerCase().includes("shiprocket") && isShiprocketConfigured()) {
    try {
      const shiprocketRes = await pushOrderToShiprocket({
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customerName,
        customerEmail: customerEmail || "customer@makhanagold.com",
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
        courierName: courierPartner,
      });

      trackingNumber = awbRes.awbCode;
      finalCourier = awbRes.courierPartner || courierPartner;
      trackingUrl = awbRes.trackingUrl;
    } catch (e) {
      console.warn("Shiprocket auto-push fallback to carrier simulation:", e);
    }
  }

  // 2. Direct Indian Courier or fallback simulation
  if (!trackingNumber) {
    const logistics = generateAwbTrackingDetails(orderNumber, courierPartner);
    trackingNumber = logistics.trackingNumber;
    finalCourier = logistics.courierPartner;
    trackingUrl = logistics.trackingUrl;
  } else if (!trackingUrl) {
    const logistics = generateAwbTrackingDetails(orderNumber, courierPartner, trackingNumber);
    trackingUrl = logistics.trackingUrl;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "shipped",
      courierPartner: finalCourier,
      trackingNumber,
      trackingUrl,
    },
    include: {
      customer: true,
    },
  });

  // Record dispatch in status history
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: "shipped",
      note: `Dispatched via ${finalCourier}. AWB / Tracking #: ${trackingNumber}`,
      changedByAdminId: adminId,
    },
  });

  // Dispatch customer email notification
  if (customerEmail && !customerEmail.includes("placeholder") && !customerEmail.includes("@phone.")) {
    try {
      await sendShippingDispatchEmail({
        to: customerEmail,
        customerName,
        orderNumber: updatedOrder.orderNumber,
        courierPartner: finalCourier,
        trackingNumber,
        trackingUrl,
      });
    } catch (err) {
      console.error("Failed to send customer dispatch email:", err);
    }
  }

  // Dispatch customer SMS notification
  if (customerPhone) {
    try {
      await sendOrderDispatchSms({
        phone: customerPhone,
        orderNumber: updatedOrder.orderNumber,
        courierPartner: finalCourier,
        trackingNumber,
        trackingUrl,
      });
    } catch (smsErr) {
      console.error("Failed to send customer dispatch SMS:", smsErr);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/fulfillment");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/checkout/confirmed/${orderNumber}`);
  revalidatePath(`/track`);
  revalidatePath(`/account/orders/${orderNumber}`);
}
