"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { pushOrderToShiprocket, assignShiprocketAwb } from "@/lib/shiprocket";
import { sendShippingDispatchEmail } from "@/lib/email";

export async function dispatchOrderAwbAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const courier = String(formData.get("courier") || "Delhivery Express");

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
  const customerPhone = order.customer.phone || "9999999999";

  // 1. Push Order to Shiprocket (or graceful fallback)
  const shiprocketRes = await pushOrderToShiprocket({
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customerName,
    customerEmail,
    customerPhone,
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

  // 2. Assign AWB Code
  const awbRes = await assignShiprocketAwb({
    shipmentId: shiprocketRes.shipmentId,
    courierName: courier,
  });

  const trackingNumber = awbRes.awbCode;
  const courierPartner = awbRes.courierPartner || courier;
  const trackingUrl = awbRes.trackingUrl;

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
          note: `Handed over to ${courierPartner}. AWB Tracking Number: ${trackingNumber} (Shipment ID: ${shiprocketRes.shipmentId})`,
        },
      },
    },
  });

  // 4. Send Automated Dispatch Email to Customer
  if (customerEmail && !customerEmail.includes("placeholder")) {
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

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath(`/checkout/confirmed/${order.orderNumber}`);
  revalidatePath(`/track`);
}
