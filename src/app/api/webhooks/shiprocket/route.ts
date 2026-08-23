import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const orderId = rawBody.order_id || rawBody.custom_order_id;
    const currentStatus = String(rawBody.current_status || rawBody.status || "").toUpperCase();
    const awbCode = rawBody.awb || rawBody.awb_code;
    const courierName = rawBody.courier_name;
    const location = rawBody.location || rawBody.current_location || "";
    const scanTime = rawBody.scans ? new Date() : new Date();

    if (!orderId && !awbCode) {
      return NextResponse.json({ error: "Missing order_id or awb" }, { status: 400 });
    }

    // Find order by orderNumber or trackingNumber
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          orderId ? { orderNumber: orderId } : { id: -1 },
          awbCode ? { trackingNumber: awbCode } : { id: -1 },
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found in database" }, { status: 404 });
    }

    let nextOrderStatus = order.status;
    let note = `Shiprocket Scan: ${currentStatus}`;
    if (location) {
      note += ` at ${location}`;
    }

    if (currentStatus.includes("DELIVERED")) {
      nextOrderStatus = "delivered";
    } else if (
      currentStatus.includes("OUT FOR DELIVERY") ||
      currentStatus.includes("IN TRANSIT") ||
      currentStatus.includes("PICKED UP") ||
      currentStatus.includes("SHIPPED")
    ) {
      nextOrderStatus = "shipped";
    } else if (currentStatus.includes("RTO") || currentStatus.includes("RETURN")) {
      nextOrderStatus = "returned";
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextOrderStatus,
        trackingNumber: awbCode || order.trackingNumber,
        courierPartner: courierName || order.courierPartner,
        statusHistory: {
          create: {
            status: nextOrderStatus,
            note,
          },
        },
      },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, status: nextOrderStatus });
  } catch (error: any) {
    console.error("Shiprocket webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
