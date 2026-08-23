import { prisma } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    orders,
    productCount,
    customerCount,
    subscriberCount,
    inquiryCount,
    broadcasts,
    lowStockStocks,
    topProductAggs,
  ] = await Promise.all([
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        items: true,
      },
    }),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.newsletterSubscriber.count({ where: { status: "active" } }),
    prisma.contactInquiry.count({ where: { status: "new" } }),
    prisma.broadcastLog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryStock.findMany({
      where: { quantityOnHand: { lte: 10 } },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      take: 5,
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 4,
    }),
  ]);

  // Overall Financial Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const paidRevenue = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const pendingFulfillment = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const razorpayOrders = orders.filter(
    (o) => o.paymentReference && !o.paymentReference.toLowerCase().includes("sim")
  );
  const razorpayRevenue = razorpayOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const codOrders = orders.filter(
    (o) => !o.paymentReference || o.paymentReference.toLowerCase().includes("sim")
  );
  const codRevenue = codOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const initialData = {
    stats: {
      totalRevenue,
      paidRevenue,
      totalOrders: orders.length,
      pendingFulfillment,
      totalCustomers: customerCount,
      newsletterSubscribers: subscriberCount,
      totalProducts: productCount,
      lowStockCount: lowStockStocks.length,
      newInquiriesCount: inquiryCount,
      razorpayRevenue,
      codRevenue,
    },
    recentOrders: orders.slice(0, 7).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer?.name || "Guest Foodie",
      customerEmail: o.customer?.email || "N/A",
      grandTotal: Number(o.grandTotal),
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentReference: o.paymentReference,
      createdAt: o.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      itemsCount: o.items.length,
    })),
    topProducts: topProductAggs.map((t) => ({
      name: t.productName,
      unitsSold: t._sum.quantity || 0,
      revenue: Number(t._sum.lineTotal || 0),
    })),
    recentBroadcasts: broadcasts.map((b) => ({
      id: b.id,
      subject: b.subject,
      audience: b.audience.replace("_", " "),
      recipientCount: b.recipientCount,
      createdAt: b.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    })),
    lowStockItems: lowStockStocks.map((s) => ({
      productName: s.variant.product.name,
      variantName: s.variant.packSize,
      stock: s.quantityOnHand,
    })),
  };

  return <DashboardClient initialData={initialData} />;
}
