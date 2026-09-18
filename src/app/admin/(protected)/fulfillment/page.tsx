import { prisma } from "@/lib/db";
import {
  FulfillmentAccordionClient,
  SerializedFulfillmentOrder,
} from "./FulfillmentAccordionClient";

export default async function AdminFulfillmentPage() {
  const rawOrders = await prisma.order.findMany({
    where: { status: { in: ["pending", "confirmed", "processing", "shipped"] } },
    include: {
      customer: true,
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serializedOrders: SerializedFulfillmentOrder[] = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentReference: o.paymentReference,
    grandTotal: Number(o.grandTotal),
    subtotal: Number(o.subtotal),
    taxTotal: Number(o.taxTotal),
    discountTotal: Number(o.discountTotal),
    shippingTotal: Number(o.shippingTotal),
    courierPartner: o.courierPartner,
    trackingNumber: o.trackingNumber,
    trackingUrl: o.trackingUrl,
    isB2b: o.isB2b,
    companyName: o.companyName,
    gstin: o.gstin,
    createdAt: o.createdAt.toISOString(),
    customer: {
      name: o.customer.name,
      email: o.customer.email,
      phone: o.customer.phone,
    },
    shippingAddress: o.shippingAddress
      ? {
          line1: o.shippingAddress.line1,
          line2: o.shippingAddress.line2,
          city: o.shippingAddress.city,
          state: o.shippingAddress.state,
          pincode: o.shippingAddress.pincode,
        }
      : null,
    items: o.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      variantName: it.variantName,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
      image: it.variant?.product?.images?.[0]?.url || null,
    })),
  }));

  return <FulfillmentAccordionClient orders={serializedOrders} />;
}
