import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/auth-admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await adminAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [recent, unreadCount, unreadByType, lowStockRows] = await Promise.all([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.adminNotification.count({ where: { isRead: false } }),
    prisma.adminNotification.groupBy({
      by: ["type"],
      where: { isRead: false },
      _count: { _all: true },
    }),
    prisma.$queryRaw<
      { c: bigint }[]
    >`SELECT COUNT(*) as c FROM inventory_stock WHERE quantity_on_hand > 0 AND quantity_on_hand <= reorder_threshold`,
  ]);

  const countByType = Object.fromEntries(unreadByType.map((row) => [row.type, row._count._all]));

  return NextResponse.json({
    unreadCount,
    recent,
    badges: {
      orders: countByType["new_order"] || 0,
      inventory: Number(lowStockRows[0]?.c ?? 0),
      inquiries: countByType["new_inquiry"] || 0,
      reviews: countByType["new_review"] || 0,
    },
  });
}
