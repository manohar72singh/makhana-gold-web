import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/content";
import { ProductPurchasePanel } from "@/components/storefront/ProductPurchasePanel";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { ProductReviewSection } from "@/components/storefront/ProductReviewSection";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://makhanagold.com";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: "active" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        orderBy: { price: "asc" },
        include: { inventoryStock: true },
      },
      category: true,
      attributes: true,
      reviews: {
        where: { isApproved: true },
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function getRelatedProducts(currentId: number, categoryId: number | null) {
  return prisma.product.findMany({
    where: {
      status: "active",
      id: { not: currentId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: {
        orderBy: { price: "asc" },
        take: 1,
        include: { inventoryStock: true },
      },
      category: true,
      attributes: true,
    },
    take: 3,
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const title = `${product.name} | Makhana Gold`;
  const description =
    product.description ||
    `Buy ${product.name} online at Makhana Gold. Artisanal slow-roasted, 100% natural, wetland-harvested makhana.`;
  const primaryImage =
    product.images[0]?.url || `${siteUrl}/images/vibrant/hero.jpg`;
  const canonicalUrl = `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalUrl}`,
      siteName: "Makhana Gold",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const sParams = await searchParams;
  const isQrScan = sParams?.source === "packet_qr" || sParams?.source === "qr";

  const [product, settings] = await Promise.all([
    getProduct(slug),
    getSiteSettings(),
  ]);
  if (!product) notFound();

  const [session, relatedProducts] = await Promise.all([
    auth(),
    getRelatedProducts(product.id, product.categoryId),
  ]);

  const customerId = session?.user?.id ? Number(session.user.id) : null;
  const wishlist = customerId
    ? await prisma.wishlist.findMany({
        where: { customerId },
        select: { variantId: true },
      })
    : [];
  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));

  const badge = product.attributes.find((a) => a.key === "best_seller")
    ? "Best Seller"
    : product.attributes.find((a) => a.key === "new")
      ? "New"
      : null;

  const barcodeAttr = product.attributes.find((a) => a.key === "barcode");
  const fssaiNumber = settings["fssai_license"] || "10021022000123";

  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 5.0;

  const primaryVariant = product.variants[0];
  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `${siteUrl}${img.url}`),
    sku: primaryVariant?.sku || `MK-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Makhana Gold",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: primaryVariant ? Number(primaryVariant.price) : 249,
      highPrice:
        product.variants.length > 1
          ? Number(product.variants[product.variants.length - 1].price)
          : primaryVariant
          ? Number(primaryVariant.price)
          : 249,
      offerCount: product.variants.length,
      offers: product.variants.map((v) => ({
        "@type": "Offer",
        price: Number(v.price),
        priceCurrency: "INR",
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/product/${product.slug}`,
        sku: v.sku,
      })),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: Math.max(1, reviewCount),
    },
  };

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-6 sm:py-8 md:py-12">
      {/* Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />

      {/* 📱 SMART QR SCAN VERIFICATION BANNER */}
      {isQrScan && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-600/15 border-2 border-amber-400 shadow-warm-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D84315] to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-sm text-base sm:text-lg font-black text-amber-950">
                  ✨ Packaging QR Verified Batch
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  100% Wetland Harvest
                </span>
              </div>
              <p className="text-xs text-amber-900/85 mt-0.5 font-medium">
                Thank you for scanning your pack! <strong>15% Repeat Refill Discount</strong> is active on your order.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-950 text-amber-300 font-mono font-bold text-xs tracking-wider border border-amber-700/50 flex items-center gap-2 shrink-0">
            <span className="text-amber-400/80">REFILL CODE:</span>
            <span className="text-white text-sm font-black">REFILL15</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex overflow-x-auto no-scrollbar text-on-surface-variant font-label-sm text-xs mb-6 sm:mb-8">
        <ol className="inline-flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <span className="material-symbols-outlined text-xs mx-1">chevron_right</span>
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop Collection
            </Link>
          </li>
          {product.category && (
            <li className="flex items-center">
              <span className="material-symbols-outlined text-xs mx-1">chevron_right</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            </li>
          )}
          <li className="flex items-center" aria-current="page">
            <span className="material-symbols-outlined text-xs mx-1">chevron_right</span>
            <span className="text-primary font-semibold">{product.name}</span>
          </li>
        </ol>
      </nav>

      {/* Main Product Purchase Section */}
      <div className="mb-10 sm:mb-14">
        <ProductPurchasePanel
          productName={product.name}
          description={product.description}
          badge={badge}
          images={product.images.map((i) => ({ url: i.url, altText: i.altText }))}
          variants={product.variants.map((v) => ({
            id: v.id,
            packSize: v.packSize,
            price: v.price.toString(),
            compareAtPrice: v.compareAtPrice?.toString() ?? null,
            inventoryStock: v.inventoryStock,
          }))}
          reviewCount={reviewCount}
          avgRating={avgRating}
        />
      </div>

      {/* Product Details & Nutrition Information Grid */}
      <section className="border-t border-outline-variant/30 pt-8 sm:pt-12 md:pt-14 mb-10 sm:mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Nutrition Table */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              Nutritional Profile
            </span>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6">
              Nutrition Facts (Per 100g)
            </h2>
            <div className="divide-y divide-outline-variant/30 font-body-md text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Energy (Calories)</span>
                <span className="font-bold text-on-surface">347 kcal</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Protein</span>
                <span className="font-bold text-on-surface">9.7 g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Carbohydrates</span>
                <span className="font-bold text-on-surface">76.9 g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Dietary Fiber</span>
                <span className="font-bold text-on-surface">14.5 g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Total Fat</span>
                <span className="font-bold text-on-surface">0.1 g (Zero Trans Fat)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Calcium</span>
                <span className="font-bold text-on-surface">60 mg</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant font-medium">Iron</span>
                <span className="font-bold text-on-surface">1.4 mg</span>
              </div>
            </div>

            {/* 🏛️ FSSAI & BARCODE BADGE STRIP */}
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-amber-900/15 flex items-center justify-center font-extrabold text-[#D84315] text-xs">
                  fssai
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                    Food Safety Certified
                  </span>
                  <span className="text-xs font-mono text-amber-800">
                    Lic. No. {fssaiNumber}
                  </span>
                </div>
              </div>
              {barcodeAttr?.value && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Retail Barcode
                  </span>
                  <span className="text-xs font-mono text-neutral-800 font-bold">
                    {barcodeAttr.value}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sourcing & Quality Pillars */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="bg-[#FAF6EE] p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient">
              <span className="font-label-sm text-xs uppercase tracking-widest text-amber-800 font-bold block mb-2">
                Generational Heritage
              </span>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-3">
                Hand-Selected Wetland Lotus Seeds
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4">
                Our Fox Nuts are carefully sourced directly from artisanal wetland harvesters in Darbhanga and Madhubani, Bihar. Each seed is hand-graded for supreme grade-6 jumbo size and dry-roasted without excess oils.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-sm">check_circle</span>
                  <span>100% Gluten-Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-sm">check_circle</span>
                  <span>Zero Preservatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-sm">check_circle</span>
                  <span>Low Glycemic Index</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-sm">check_circle</span>
                  <span>Rich in Antioxidants</span>
                </div>
              </div>
            </div>

            {/* Storage & Shelf Life */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-800 shrink-0">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  Storage &amp; Best Before
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Store in a cool, dry place away from direct sunlight. Reseal airtight pouch after opening. Best consumed within 9 months of packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ProductReviewSection
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        reviews={product.reviews}
        userName={session?.user?.name || ""}
      />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-1">
                Curated Flavours
              </span>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
                You May Also Relish
              </h2>
            </div>
            <Link
              href="/shop"
              className="font-label-md text-xs sm:text-sm text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductGridCard
                key={relProduct.id}
                product={relProduct}
                isWishlisted={
                  relProduct.variants[0]
                    ? wishlistedIds.has(relProduct.variants[0].id)
                    : false
                }
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
