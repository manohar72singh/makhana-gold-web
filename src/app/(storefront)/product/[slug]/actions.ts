"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notifyAdmins } from "@/lib/admin-notifications";

export async function submitProductReviewAction(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const productId = Number(formData.get("productId"));
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const authorName = String(formData.get("authorName") || "").trim();
  const slug = String(formData.get("slug") || "");

  let effectiveCustomerId = customerId;

  // If guest, create or find customer by name/guest email
  if (!effectiveCustomerId) {
    const guestEmail = `reviewer_${Date.now()}@guest.makhanagold.com`;
    const newCust = await prisma.customer.create({
      data: {
        name: authorName || "Anonymous Snacker",
        email: guestEmail,
      },
    });
    effectiveCustomerId = newCust.id;
  } else if (authorName) {
    await prisma.customer.update({
      where: { id: effectiveCustomerId },
      data: { name: authorName },
    });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      customerId: effectiveCustomerId,
      rating,
      title: title || null,
      body: body || null,
      isApproved: true, // auto-approve storefront reviews
    },
    include: { product: { select: { name: true } } },
  });

  await notifyAdmins({
    type: "new_review",
    title: `New ${rating}★ review — ${review.product.name}`,
    message: title || body || undefined,
    link: "/admin/cms/reviews",
  });

  if (slug) {
    revalidatePath(`/product/${slug}`);
  }
  revalidatePath("/", "layout");
}
