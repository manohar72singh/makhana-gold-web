import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { CouponCard } from "@/components/storefront/CouponCard";

export const metadata: Metadata = {
  title: "Exclusive Offers, Coupons & Festive Gift Hampers",
  description:
    "Unlock instant savings on premium roasted makhana with coupon codes like GOLDEN15 and FREESHIP. Explore curated festive gift bundles and variety packs.",
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    title: "Exclusive Offers & Gift Bundles | Makhana Gold",
    description:
      "Exclusive discounts and festive hampers for healthy mindful snacking.",
    url: "https://makhanagold.com/offers",
    siteName: "Makhana Gold",
    images: ["/images/products/heritage-bundle.jpg"],
  },
};

export default async function OffersPage() {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const [coupons, bundles, allProducts, wishlist] = await Promise.all([
    prisma.coupon.findMany({ where: { isActive: true } }),
    prisma.product.findMany({
      where: {
        status: "active",
        OR: [
          { slug: { contains: "bundle" } },
          { variants: { some: { packSize: { contains: "Box" } } } },
        ],
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { price: "asc" }, take: 1 },
        attributes: true,
        category: true,
      },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { price: "asc" }, take: 1 },
        attributes: true,
        category: true,
      },
      take: 4,
    }),
    customerId
      ? prisma.wishlist.findMany({ where: { customerId }, select: { variantId: true } })
      : Promise.resolve([]),
  ]);

  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));
  const displayBundles = bundles.length > 0 ? bundles : allProducts;

  return (
    <main className="pb-huge">
      {/* 1. Hero Section */}
      <section className="bg-primary text-on-primary py-16 md:py-24 px-gutter text-center relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-72 h-72 bg-primary-container/20 rounded-full blur-3xl" />
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="font-label-sm text-xs uppercase tracking-widest text-primary-fixed block mb-2 font-bold">
            Curated Snacking
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4">
            Exclusive Offers & Bundles
          </h1>
          <p className="font-body-lg text-sm md:text-base opacity-90 leading-relaxed max-w-xl mx-auto">
            Festive gift collections, pantry variety packs, and exclusive seasonal coupon codes.
          </p>
        </div>
      </section>

      {/* 2. Active Coupons Section */}
      <section className="max-w-container-max mx-auto px-gutter py-12 md:py-16">
        <div className="mb-8">
          <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-1">
            Instant Savings
          </span>
          <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-primary">
            Active Discount Codes
          </h2>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1">
            Copy code and paste during checkout to unlock instant discounts.
          </p>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center text-sm text-on-surface-variant">
            No active discount codes available today. Check back during upcoming festivals!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                code={coupon.code}
                type={coupon.type}
                value={Number(coupon.value)}
                minOrderValue={Number(coupon.minOrderValue)}
              />
            ))}
          </div>
        )}

        {/* 3. Curated Bundles Grid */}
        <div className="mb-8 flex justify-between items-end border-t border-outline-variant/20 pt-12">
          <div>
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-1">
              Value Sets
            </span>
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-primary">
              Artisanal Gift Bundles
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-label-md text-primary hover:text-secondary uppercase tracking-wider hidden sm:inline-flex items-center gap-1 font-bold"
          >
            All Products <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBundles.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.variants[0]?.id)}
              showWishlist
            />
          ))}
        </div>
      </section>
    </main>
  );
}
