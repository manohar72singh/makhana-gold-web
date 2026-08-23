"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function toggleWishlistAction(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) redirect("/login");

  const variantId = Number(formData.get("variantId"));
  const productId = Number(formData.get("productId"));

  const existing = await prisma.wishlist.findUnique({
    where: { customerId_variantId: { customerId, variantId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({ data: { customerId, variantId, productId } });
  }

  revalidatePath("/", "layout");
}
