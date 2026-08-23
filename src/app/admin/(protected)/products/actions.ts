"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "draft") as "draft" | "active" | "archived";
  const packSize = String(formData.get("packSize") || "100g").trim();
  const price = Number(formData.get("price") || 0);
  const compareAtPriceRaw = formData.get("compareAtPrice");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const sku = String(formData.get("sku") || `MG-${Date.now().toString(36).toUpperCase()}`).trim();
  const stockQuantity = Number(formData.get("stockQuantity") || 100);
  const barcode = String(formData.get("barcode") || "").trim();
  const packagingArtworkUrl = String(formData.get("packagingArtworkUrl") || "").trim();

  const imagesJsonRaw = String(formData.get("imagesJson") || "[]");
  let images: Array<{ url: string; isPrimary?: boolean; altText?: string }> = [];
  try {
    images = JSON.parse(imagesJsonRaw);
  } catch (e) {
    images = [];
  }

  // 1. Create Product and Variant
  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      description,
      categoryId: categoryId || null,
      status,
      variants: {
        create: [
          {
            sku,
            packSize,
            price,
            compareAtPrice,
          },
        ],
      },
    },
    include: {
      variants: true,
    },
  });

  // 2. Attach Inventory Stock
  const defaultWarehouse = await prisma.warehouse.findFirst();
  if (defaultWarehouse && product.variants[0]) {
    await prisma.inventoryStock.create({
      data: {
        warehouseId: defaultWarehouse.id,
        variantId: product.variants[0].id,
        quantityOnHand: stockQuantity,
      },
    });
  }

  // 3. Attach Product Images
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img, idx) => ({
        productId: product.id,
        url: img.url,
        altText: img.altText || name,
        sortOrder: idx,
        isPrimary: img.isPrimary ?? idx === 0,
      })),
    });
  }

  // 4. Attach Barcode & Packaging Artwork Attributes
  const attributesToCreate: Array<{ productId: number; key: string; value: string }> = [];
  if (barcode) {
    attributesToCreate.push({ productId: product.id, key: "barcode", value: barcode });
  }
  if (packagingArtworkUrl) {
    attributesToCreate.push({ productId: product.id, key: "packaging_artwork", value: packagingArtworkUrl });
  }
  if (attributesToCreate.length > 0) {
    await prisma.productAttribute.createMany({ data: attributesToCreate });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(formData: FormData) {
  const id = Number(formData.get("productId"));
  const name = String(formData.get("name") || "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "draft") as "draft" | "active" | "archived";
  const barcode = String(formData.get("barcode") || "").trim();
  const packagingArtworkUrl = String(formData.get("packagingArtworkUrl") || "").trim();

  const imagesJsonRaw = String(formData.get("imagesJson") || "[]");
  let images: Array<{ url: string; isPrimary?: boolean; altText?: string }> = [];
  try {
    images = JSON.parse(imagesJsonRaw);
  } catch (e) {
    images = [];
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId: categoryId || null,
      description,
      status,
    },
  });

  // Replace Images
  if (images.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: images.map((img, idx) => ({
        productId: id,
        url: img.url,
        altText: img.altText || name,
        sortOrder: idx,
        isPrimary: img.isPrimary ?? idx === 0,
      })),
    });
  }

  // Update Attributes (barcode & packaging_artwork)
  await prisma.productAttribute.deleteMany({
    where: {
      productId: id,
      key: { in: ["barcode", "packaging_artwork"] },
    },
  });

  const attributesToCreate: Array<{ productId: number; key: string; value: string }> = [];
  if (barcode) {
    attributesToCreate.push({ productId: id, key: "barcode", value: barcode });
  }
  if (packagingArtworkUrl) {
    attributesToCreate.push({ productId: id, key: "packaging_artwork", value: packagingArtworkUrl });
  }
  if (attributesToCreate.length > 0) {
    await prisma.productAttribute.createMany({ data: attributesToCreate });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get("productId"));
  await prisma.productAttribute.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.wishlist.deleteMany({ where: { productId: id } });
  const variants = await prisma.productVariant.findMany({ where: { productId: id } });
  for (const v of variants) {
    await prisma.inventoryStock.deleteMany({ where: { variantId: v.id } });
    await prisma.cartItem.deleteMany({ where: { variantId: v.id } });
  }
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}
