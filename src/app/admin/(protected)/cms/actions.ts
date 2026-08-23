"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/support");
  revalidatePath("/our-story");
  revalidatePath("/offers");
  revalidatePath("/admin/cms/banners");
  revalidatePath("/admin/cms/pillars");
  revalidatePath("/admin/cms/marketplaces");
  revalidatePath("/admin/cms/faqs");
  revalidatePath("/admin/cms/reviews");
}

// ---------------------------------------------------------------------------
// 1. Hero Banners Actions
// ---------------------------------------------------------------------------

export async function upsertHeroBannerAction(formData: FormData) {
  const idStr = formData.get("id") as string | null;
  const id = idStr ? Number(idStr) : undefined;
  const slideKey = (formData.get("slideKey") as string)?.trim() || `slide-${Date.now()}`;
  const badge = (formData.get("badge") as string)?.trim() || "";
  const badgeColor = (formData.get("badgeColor") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || "";
  const highlightTitle = (formData.get("highlightTitle") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const ctaText = (formData.get("ctaText") as string)?.trim() || "Shop Now";
  const ctaLink = (formData.get("ctaLink") as string)?.trim() || "/shop";
  const secondaryCtaText = (formData.get("secondaryCtaText") as string)?.trim() || null;
  const secondaryCtaLink = (formData.get("secondaryCtaLink") as string)?.trim() || null;
  const bgImage = (formData.get("bgImage") as string)?.trim() || "/images/vibrant/hero.jpg";
  const theme = ((formData.get("theme") as string) === "dark" ? "dark" : "light") as string;
  const socialProof = (formData.get("socialProof") as string)?.trim() || null;
  const showMarketplaces = formData.get("showMarketplaces") === "true" || formData.get("showMarketplaces") === "on";
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on" || !id;

  const data = {
    slideKey,
    badge,
    badgeColor,
    title,
    highlightTitle,
    description,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    bgImage,
    theme,
    socialProof,
    showMarketplaces,
    sortOrder,
    isActive,
  };

  if (id) {
    await prisma.heroBanner.update({
      where: { id },
      data,
    });
  } else {
    await prisma.heroBanner.create({
      data,
    });
  }

  revalidateStorefront();
}

export async function deleteHeroBannerAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.heroBanner.delete({ where: { id } });
    revalidateStorefront();
  }
}

export async function toggleHeroBannerAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  if (id) {
    await prisma.heroBanner.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidateStorefront();
  }
}

// ---------------------------------------------------------------------------
// 2. Feature Pillars (Trust Badges & Health Benefits)
// ---------------------------------------------------------------------------

export async function upsertFeaturePillarAction(formData: FormData) {
  const idStr = formData.get("id") as string | null;
  const id = idStr ? Number(idStr) : undefined;
  const section = (formData.get("section") as string)?.trim() || "trust_badge";
  const title = (formData.get("title") as string)?.trim() || "";
  const value = (formData.get("value") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || "";
  const icon = (formData.get("icon") as string)?.trim() || "verified";
  const accentColor = (formData.get("accentColor") as string)?.trim() || null;
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on" || !id;

  const data = {
    section,
    title,
    value,
    description,
    icon,
    accentColor,
    sortOrder,
    isActive,
  };

  if (id) {
    await prisma.featurePillar.update({
      where: { id },
      data,
    });
  } else {
    await prisma.featurePillar.create({
      data,
    });
  }

  revalidateStorefront();
}

export async function deleteFeaturePillarAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.featurePillar.delete({ where: { id } });
    revalidateStorefront();
  }
}

export async function toggleFeaturePillarAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  if (id) {
    await prisma.featurePillar.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidateStorefront();
  }
}

// ---------------------------------------------------------------------------
// 3. Marketplace Links
// ---------------------------------------------------------------------------

export async function upsertMarketplaceLinkAction(formData: FormData) {
  const idStr = formData.get("id") as string | null;
  const id = idStr ? Number(idStr) : undefined;
  const name = (formData.get("name") as string)?.trim() || "";
  const platformKey = (formData.get("platformKey") as string)?.trim().toLowerCase() || `app-${Date.now()}`;
  const url = (formData.get("url") as string)?.trim() || "";
  const badgeText = (formData.get("badgeText") as string)?.trim() || null;
  const borderHover = (formData.get("borderHover") as string)?.trim() || "hover:border-amber-500";
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on" || !id;

  const data = {
    name,
    platformKey,
    url,
    badgeText,
    borderHover,
    sortOrder,
    isActive,
  };

  if (id) {
    await prisma.marketplaceLink.update({
      where: { id },
      data,
    });
  } else {
    await prisma.marketplaceLink.create({
      data,
    });
  }

  revalidateStorefront();
}

export async function deleteMarketplaceLinkAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.marketplaceLink.delete({ where: { id } });
    revalidateStorefront();
  }
}

export async function toggleMarketplaceLinkAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  if (id) {
    await prisma.marketplaceLink.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidateStorefront();
  }
}

// ---------------------------------------------------------------------------
// 4. FAQ Items
// ---------------------------------------------------------------------------

export async function upsertFaqItemAction(formData: FormData) {
  const idStr = formData.get("id") as string | null;
  const id = idStr ? Number(idStr) : undefined;
  const category = (formData.get("category") as string)?.trim() || "General";
  const question = (formData.get("question") as string)?.trim() || "";
  const answer = (formData.get("answer") as string)?.trim() || "";
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on" || !id;

  const data = {
    category,
    question,
    answer,
    sortOrder,
    isActive,
  };

  if (id) {
    await prisma.faqItem.update({
      where: { id },
      data,
    });
  } else {
    await prisma.faqItem.create({
      data,
    });
  }

  revalidateStorefront();
}

export async function deleteFaqItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.faqItem.delete({ where: { id } });
    revalidateStorefront();
  }
}

export async function toggleFaqItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  if (id) {
    await prisma.faqItem.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidateStorefront();
  }
}

// ---------------------------------------------------------------------------
// 5. Customer Reviews Moderation
// ---------------------------------------------------------------------------

export async function updateReviewStatusAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isApproved = formData.get("isApproved") === "true";
  if (id) {
    await prisma.review.update({
      where: { id },
      data: { isApproved },
    });
    revalidateStorefront();
  }
}

export async function deleteReviewAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.review.delete({ where: { id } });
    revalidateStorefront();
  }
}
