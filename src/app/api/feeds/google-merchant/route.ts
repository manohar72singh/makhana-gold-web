import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/content";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function GET() {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://makhanagold.com";
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      include: {
        variants: {
          include: {
            inventoryStock: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  const storeName = settings["store_name"] || "Makhana Gold";
  const storeDesc =
    settings["store_description"] ||
    "Artisanal Heritage • Modern Wellness. Hand-harvested and slow-roasted Bihar wetland fox nuts.";

  const itemsXml: string[] = [];

  for (const product of products) {
    const mainImage = product.images[0]?.url
      ? product.images[0].url.startsWith("http")
        ? product.images[0].url
        : `${siteUrl}${product.images[0].url}`
      : `${siteUrl}/images/vibrant/hero.jpg`;

    const productUrl = `${siteUrl}/product/${product.slug}`;

    for (const variant of product.variants) {
      const itemId = `MG-${product.id}-${variant.id}`;
      const title = `${product.name} (${variant.packSize})`;
      const price = `${Number(variant.price).toFixed(2)} INR`;
      const stockQty = variant.inventoryStock.reduce(
        (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );
      const availability = stockQty > 0 ? "in_stock" : "out_of_stock";
      const description = product.description || storeDesc;

      itemsXml.push(`
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(storeName)}</g:brand>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Snack Foods</g:google_product_category>
      <g:product_type>${escapeXml(product.category?.name || "Fox Nuts &gt; Roasted Makhana")}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Courier</g:service>
        <g:price>60.00 INR</g:price>
      </g:shipping>
    </item>`);
    }
  }

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(storeName)} - Google Merchant Center Product Feed</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(storeDesc)}</description>
    ${itemsXml.join("")}
  </channel>
</rss>`.trim();

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200",
    },
  });
}
