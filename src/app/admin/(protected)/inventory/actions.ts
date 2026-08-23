"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function adjustStockAction(formData: FormData) {
  const stockId = Number(formData.get("stockId"));
  const delta = Number(formData.get("delta"));

  await prisma.inventoryStock.update({
    where: { id: stockId },
    data: { quantityOnHand: { increment: delta } },
  });

  revalidatePath("/admin/inventory");
}
