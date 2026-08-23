"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createCampaignAction(formData: FormData) {
  await prisma.campaign.create({
    data: {
      name: String(formData.get("name") || ""),
      type: String(formData.get("type") || "seasonal"),
      status: "active",
    },
  });
  revalidatePath("/admin/campaigns");
}
