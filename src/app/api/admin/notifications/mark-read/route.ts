import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/auth-admin";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await adminAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.all) {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  }

  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.adminNotification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
