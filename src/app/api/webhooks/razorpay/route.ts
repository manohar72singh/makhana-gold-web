import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const paymentId = paymentEntity?.id;
      const orderNumber = paymentEntity?.notes?.orderNumber || paymentEntity?.description;

      if (orderNumber) {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
        });

        if (order && order.paymentStatus !== "paid") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "confirmed",
              paymentStatus: "paid",
              paymentReference: paymentId || order.paymentReference,
              statusHistory: {
                create: {
                  status: "confirmed",
                  note: `Webhook verified payment capture. Event: ${event} (Txn: ${paymentId})`,
                },
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
