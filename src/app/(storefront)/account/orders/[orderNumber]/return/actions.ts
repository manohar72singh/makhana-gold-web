"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function submitReturnAction(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) redirect("/login");

  const orderItemId = Number(formData.get("orderItemId"));
  const orderId = Number(formData.get("orderId"));
  const orderNumber = String(formData.get("orderNumber"));
  const reason = String(formData.get("reason") || "");

  await prisma.return.create({
    data: { orderId, orderItemId, customerId, reason, status: "requested" },
  });

  redirect(`/account/orders/${orderNumber}?returnSubmitted=1`);
}
