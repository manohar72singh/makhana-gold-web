"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createWarehouseAction(formData: FormData) {
  await prisma.warehouse.create({
    data: {
      name: String(formData.get("name") || ""),
      city: String(formData.get("city") || "") || null,
      state: String(formData.get("state") || "") || null,
      addressLine1: String(formData.get("addressLine1") || "") || null,
    },
  });
  revalidatePath("/admin/shipping-config");
}
