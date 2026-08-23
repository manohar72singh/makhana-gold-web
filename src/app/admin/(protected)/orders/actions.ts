"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { adminAuth } from "@/lib/auth-admin";
import { generateAwbTrackingDetails } from "@/lib/logistics";
import { sendShippingDispatchEmail } from "@/lib/email";

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

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await prisma.orderStatusHistory.create({
    data: { orderId, status, note: note || null, changedByAdminId: adminId },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
}

export async function dispatchCourierOrderAction(formData: FormData) {
  const session = await adminAuth();
  const adminId = session?.user?.id ? Number(session.user.id) : null;

  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));
  const courierPartner = String(formData.get("courierPartner") || "Delhivery Express");
  let trackingNumber = String(formData.get("trackingNumber") || "").trim();

  // If no tracking number manually provided, generate smart carrier AWB
  const logistics = generateAwbTrackingDetails(orderNumber, courierPartner);
  if (!trackingNumber) {
    trackingNumber = logistics.trackingNumber;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "shipped",
      courierPartner,
      trackingNumber,
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
      note: `Dispatched via ${courierPartner}. AWB / Tracking #: ${trackingNumber}`,
      changedByAdminId: adminId,
    },
  });

  // Dispatch customer email notification
  if (updatedOrder.customer?.email) {
    try {
      await sendShippingDispatchEmail({
        to: updatedOrder.customer.email,
        customerName: updatedOrder.customer.name || "Valued Customer",
        orderNumber: updatedOrder.orderNumber,
        courierPartner,
        trackingNumber,
        trackingUrl: logistics.trackingUrl,
      });
    } catch (err) {
      console.error("Failed to send customer dispatch email:", err);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/track`);
}
