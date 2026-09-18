import { prisma } from "@/lib/db";
import { OrdersAccordionClient, SerializedOrder } from "./OrdersAccordionClient";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;
type OrderStatusType = (typeof VALID_STATUSES)[number];

interface OrdersPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams?.status?.toLowerCase() || "all";

  // Aggregate counts for each status
  const countsGroup = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  let totalCount = 0;
  for (const item of countsGroup) {
    countMap[item.status] = item._count.id;
    totalCount += item._count.id;
  }

  // Active fulfillment queue count (pending, confirmed, processing)
  const activeFulfillmentCount =
    (countMap["pending"] || 0) +
    (countMap["confirmed"] || 0) +
    (countMap["processing"] || 0);

  const isValidStatus = VALID_STATUSES.includes(currentFilter as OrderStatusType);
  const whereClause = isValidStatus ? { status: currentFilter as OrderStatusType } : {};

  const rawOrders = await prisma.order.findMany({
    where: whereClause,
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

  const filterTabs = [
    { label: "All Orders", value: "all", count: totalCount },
    { label: "Pending", value: "pending", count: countMap["pending"] || 0 },
    { label: "Confirmed", value: "confirmed", count: countMap["confirmed"] || 0 },
    { label: "Processing (Packing)", value: "processing", count: countMap["processing"] || 0 },
    { label: "Shipped (In-Transit)", value: "shipped", count: countMap["shipped"] || 0 },
    { label: "Delivered", value: "delivered", count: countMap["delivered"] || 0 },
    { label: "Cancelled", value: "cancelled", count: countMap["cancelled"] || 0 },
  ];

  const serializedOrders: SerializedOrder[] = rawOrders.map((o) => ({
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

  return (
    <OrdersAccordionClient
      orders={serializedOrders}
      filterTabs={filterTabs}
      activeFulfillmentCount={activeFulfillmentCount}
    />
  );
}
