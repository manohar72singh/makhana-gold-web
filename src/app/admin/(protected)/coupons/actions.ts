"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createCouponAction(formData: FormData) {
  await prisma.coupon.create({
    data: {
      code: String(formData.get("code")).toUpperCase(),
      type: String(formData.get("type")) as "percent" | "fixed",
      value: Number(formData.get("value")),
      minOrderValue: Number(formData.get("minOrderValue") || 0),
      isActive: true,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(formData: FormData) {
  const id = Number(formData.get("couponId"));
  const isActive = formData.get("isActive") === "true";
  await prisma.coupon.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/admin/coupons");
}
