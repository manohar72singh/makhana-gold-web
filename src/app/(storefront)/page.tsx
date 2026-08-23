import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { HeroBannerSlider } from "@/components/storefront/HeroBannerSlider";
import { MarketplaceShowcaseBanner } from "@/components/storefront/MarketplaceShowcaseBanner";
import {
  getHeroBanners,
  getTrustBadges,
  getHealthBenefits,
  getMarketplaceLinks,
  getStorefrontReviews,
} from "@/lib/content";

async function getBestSellers() {
  try {
    if (!prisma.product) return [];
    return await prisma.product.findMany({
      where: { status: "active" },
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
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export default async function HomePage() {
  const [
    heroBanners,
    trustBadges,
    healthBenefits,
    marketplaceLinks,
    storefrontReviews,
    bestSellers,
    session,
  ] = await Promise.all([
    getHeroBanners(),
    getTrustBadges(),
    getHealthBenefits(),
    getMarketplaceLinks(),
    getStorefrontReviews(),
    getBestSellers(),
    auth(),
  ]);

  const customerId = session?.user?.id ? Number(session.user.id) : null;
  let wishlist: { variantId: number }[] = [];
  if (customerId) {
    try {
      wishlist = await prisma.wishlist.findMany({
        where: { customerId },
        select: { variantId: true },
      });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }
  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));

  return (
    <main className="overflow-hidden">
      {/* 1. Dynamic Multi-Banner Hero Slider (100% DB-driven) */}
      <HeroBannerSlider slides={heroBanners} />

      {/* 2. Trust Badges Bar (100% DB-driven) */}
      {trustBadges.length > 0 && (
        <section className="bg-white border-y border-amber-900/10 py-5 px-gutter shadow-xs">
          <div className="max-w-container-max mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3.5 p-2 rounded-2xl">
                <div
                  className={`w-11 h-11 rounded-2xl ${badge.color} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <span className="material-symbols-outlined text-xl">{badge.icon}</span>
                </div>
                <div>
                  <h4 className="font-label-md text-xs sm:text-sm font-bold text-on-surface mb-0.5">
                    {badge.title}
                  </h4>
                  <p className="font-body-sm text-[11px] sm:text-xs text-on-surface-variant line-clamp-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Best Sellers Showcase (Direct Product Catalog) */}
      <section className="py-10 md:py-16 bg-[#FAF6EE] px-5 sm:px-gutter border-b border-amber-900/10">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8 sm:mb-10">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                Customer Favorites
              </span>
              <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mb-1">
                The Gold Standard Collection
              </h2>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Our most celebrated roasted fox nuts, packed fresh at origin in small batches.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-amber-800 hover:text-[#E64A19] font-label-md text-xs sm:text-sm font-bold transition-colors group"
            >
              <span>Explore All Flavours</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {bestSellers.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedIds.has(product.variants[0]?.id)}
                showWishlist
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Editorial Heritage Storytelling Banner */}
      <section className="py-10 md:py-16 px-5 sm:px-gutter max-w-container-max mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-warm-2 border border-amber-900/10 grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Image — full-width on mobile, left half on desktop */}
          <div className="lg:col-span-6 relative aspect-video sm:aspect-[16/8] lg:aspect-auto lg:h-[380px]">
            <Image
              src="/images/vibrant/wetlands.jpg"
              alt="Harvesting Makhana in Bihar Wetlands"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 bg-white/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl shadow-ambient border border-white/50 text-[10px] sm:text-[11px] font-bold text-on-surface">
              📍 Mithila &amp; Darbhanga Wetlands, Bihar
            </div>
          </div>

          <div className="lg:col-span-6 p-5 sm:p-8 lg:p-9 space-y-4">
            <span className="font-label-sm text-[11px] text-amber-700 font-bold uppercase tracking-widest block">
              Generational Heritage
            </span>

            <h2 className="font-display-lg text-2xl sm:text-3xl text-on-surface font-bold leading-tight">
              Rooted in Heritage.<br />
              <span className="italic font-normal text-amber-700">Refined for Today.</span>
            </h2>

            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Every fox nut begins its life deep in the tranquil, mineral-rich wetland ponds of Bihar. Cultivated with ancient knowledge by generational farming families, our lotus seeds are harvested at peak ripeness, sun-dried, and slow-roasted to golden crispness.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-amber-900/10">
                <span className="block font-headline-sm text-lg font-bold text-amber-700">100%</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Wetland Harvested</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-amber-900/10">
                <span className="block font-headline-sm text-lg font-bold text-amber-700">Zero</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Palm Oil or MSG</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/our-story"
                className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest transition-all shadow-vermillion-glow inline-flex items-center gap-2 font-bold cursor-pointer"
              >
                <span>Read The Full Story</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Health Pillars Bento (100% DB-driven) */}
      {healthBenefits.length > 0 && (
        <section className="py-10 md:py-16 bg-[#FAF6EE] px-5 sm:px-gutter border-y border-amber-900/10">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-8 sm:mb-10 max-w-xl mx-auto">
              <span className="font-label-sm text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                Functional Superfood
              </span>
              <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mb-2">
                Why Makhana Gold?
              </h2>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                More than an artisanal snack — an ancient superfood recalibrated for modern health consciousness.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {healthBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-ambient border border-amber-900/10 hover:shadow-warm-2 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br ${benefit.accent} flex items-center justify-center mb-2 sm:mb-3 shadow-xs`}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">{benefit.icon}</span>
                    </div>
                    <span className="inline-block bg-amber-100 text-amber-900 font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5">
                      {benefit.value}
                    </span>
                    <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface mb-1">
                      {benefit.title}
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Customer Testimonials (100% DB-driven from Approved Reviews) */}
      {storefrontReviews.length > 0 && (
        <section className="py-10 md:py-16 px-5 sm:px-gutter max-w-container-max mx-auto">
          <div className="text-center mb-8 sm:mb-10 max-w-xl mx-auto">
            <span className="font-label-sm text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
              Loved Across India
            </span>
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mb-2">
              Praise From Conscious Pantries
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {storefrontReviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-5 sm:p-7 shadow-ambient border border-amber-900/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-500 mb-3 text-sm">
                    {"★".repeat(review.rating)}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-xs sm:text-sm text-on-surface mb-2">
                      {review.title}
                    </h4>
                  )}
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant italic mb-5 leading-relaxed line-clamp-4 sm:line-clamp-none">
                    &ldquo;{review.body}&rdquo;
                  </p>
                </div>

                <div className="border-t border-amber-900/10 pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                      {review.customer.name || "Verified Customer"}
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Verified Buyer • {review.product.name}
                    </p>
                  </div>
                  <span
                    className="material-symbols-outlined text-emerald-600 text-base"
                    title="Verified Customer"
                  >
                    verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Marketplace Quick-Commerce Banner (100% DB-driven) */}
      <MarketplaceShowcaseBanner platforms={marketplaceLinks} />
    </main>
  );
}
