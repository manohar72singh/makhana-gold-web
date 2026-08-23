"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSiteSettingsAction(formData: FormData) {
  const entries = Array.from(formData.entries());

  for (const [key, rawValue] of entries) {
    if (key.startsWith("$ACTION_") || key.startsWith("NEXT_")) continue;
    const value = String(rawValue ?? "");

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value },
    });
  }

  // Instant cache revalidation across entire storefront
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/support");
  revalidatePath("/our-story");
  revalidatePath("/offers");
  revalidatePath("/admin/settings");

  return { success: true };
}
