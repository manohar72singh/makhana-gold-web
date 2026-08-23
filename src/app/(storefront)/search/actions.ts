"use server";

import { prisma } from "@/lib/db";

export async function searchLiveProductsAction(query: string) {
  const q = query.trim();
  if (!q) return [];

  const products = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    take: 6,
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    categoryName: p.category?.name || "Artisanal Makhana",
    imageUrl: p.images[0]?.url || "/images/products/himalayan-pink-salt.jpg",
    variantId: p.variants[0]?.id || 1,
    packSize: p.variants[0]?.packSize || "Standard",
    price: p.variants[0] ? Number(p.variants[0].price) : 199,
  }));
}
