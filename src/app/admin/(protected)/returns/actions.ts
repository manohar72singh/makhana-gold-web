"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateReturnStatusAction(formData: FormData) {
  const id = Number(formData.get("returnId"));
  const status = String(formData.get("status")) as "requested" | "approved" | "rejected" | "refunded";
  const refundAmount = formData.get("refundAmount") ? Number(formData.get("refundAmount")) : undefined;

  await prisma.return.update({
    where: { id },
    data: {
      status,
      refundAmount,
      resolvedAt: status === "approved" || status === "rejected" || status === "refunded" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/returns");
}
