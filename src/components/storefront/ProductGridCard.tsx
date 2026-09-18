import Image from "next/image";
import Link from "next/link";
import { toggleWishlistAction } from "@/app/(storefront)/wishlist-actions";
import { QuickViewTrigger } from "@/components/storefront/QuickViewModal";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export function ProductGridCard({
  product,
  isWishlisted,
  showWishlist = true,
  badge,
  badgeType,
}: {
  product: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    category?: { name: string } | null;
    images: { url: string; altText: string | null }[];
    variants: {
      id: number;
      packSize: string;
      price: unknown;
      inventoryStock?: { quantityOnHand: number }[];
    }[];
    attributes?: { key: string }[];
    isHotDeal?: boolean;
    isBestSeller?: boolean;
  };
  isWishlisted?: boolean;
  showWishlist?: boolean;
  badge?: string | null;
  badgeType?: "hot_deal" | "best_seller" | "new_arrival" | "new_harvest" | "custom";
}) {
  const image = product.images[0];
  const variant = product.variants[0];

  // Calculate stock across variant
  const stock = variant?.inventoryStock
    ? variant.inventoryStock.reduce((sum, s) => sum + s.quantityOnHand, 0)
    : 100; // default in-stock fallback if not joined

  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;

  // Unified badge resolution (only 1 badge is ever displayed per card)
  let badgeText: string | null = null;
  let badgeStyle = "";

  if (isSoldOut) {
    badgeText = "Sold Out";
    badgeStyle = "bg-neutral-900 text-white font-extrabold border border-neutral-700";
  } else if (isLowStock) {
    badgeText = `🔥 Only ${stock} Left`;
    badgeStyle = "bg-amber-500 text-amber-950 font-black animate-pulse border border-amber-600";
  } else if (badge) {
    badgeText = badge;
    if (badgeType === "hot_deal" || badge.toLowerCase().includes("hot deal")) {
      badgeStyle = "bg-red-600 text-white font-black shadow-md";
    } else if (badgeType === "best_seller" || badge.toLowerCase().includes("best seller")) {
      badgeStyle = "bg-amber-500 text-white font-black shadow-md";
    } else if (badgeType === "new_arrival" || badge.toLowerCase().includes("new")) {
      badgeStyle = "bg-emerald-700 text-white font-bold shadow-md";
    } else {
      badgeStyle = "bg-emerald-600 text-white font-bold shadow-xs";
    }
  } else if (product.isHotDeal) {
    badgeText = "🔥 Hot Deal";
    badgeStyle = "bg-red-600 text-white font-black shadow-md";
  } else if (product.isBestSeller) {
    badgeText = "⭐ Best Seller";
    badgeStyle = "bg-amber-500 text-white font-black shadow-md";
  } else if (product.attributes?.some((a) => a.key === "new")) {
    badgeText = "New Harvest";
    badgeStyle = "bg-emerald-600 text-white font-bold";
  }

  return (
    <article
      className={`group bg-white rounded-3xl overflow-hidden shadow-ambient hover:shadow-warm-2 transition-all duration-500 flex flex-col relative border ${
        isSoldOut
          ? "border-gray-200 opacity-90"
          : isLowStock
          ? "border-amber-400/80 hover:border-amber-500"
          : "border-amber-900/10 hover:border-amber-400"
      }`}
    >
      {/* 🏷️ SINGLE UNIFIED PROMOTIONAL / INVENTORY BADGE */}
      {badgeText && (
        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className={`font-label-sm text-[10px] uppercase px-3 py-1 rounded-full tracking-wider shadow-md flex items-center gap-1.5 ${badgeStyle}`}
          >
            {badgeText === "Sold Out" && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
            {badgeText}
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      {showWishlist && variant && (
        <form action={toggleWishlistAction} className="absolute top-3.5 right-3.5 z-10">
          <input type="hidden" name="variantId" value={variant.id} />
          <input type="hidden" name="productId" value={product.id} />
          <button
            aria-label="Toggle wishlist"
            type="submit"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-[#E64A19] transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 border border-amber-900/10"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1", color: "#E64A19" } : undefined}
            >
              favorite
            </span>
          </button>
        </form>
      )}

      {/* Quick View Trigger on Hover */}
      {variant && !isSoldOut && (
        <QuickViewTrigger
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            images: product.images.map((img) => ({
              url: img.url,
              altText: img.altText,
            })),
            variants: product.variants.map((v) => ({
              id: v.id,
              packSize: v.packSize,
              price: String(v.price),
            })),
          }}
        />
      )}

      {/* Image Banner */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-4/3 bg-[#FAF6EE] overflow-hidden block"
      >
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? `${product.name}${variant?.packSize ? ` — ${variant.packSize}` : ""} — Makhana Gold`}
            title={`${product.name} — Buy Online at Makhana Gold`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover group-hover:scale-106 transition-transform duration-700 ease-out ${
              isSoldOut ? "grayscale-[60%] opacity-80" : ""
            }`}
          />
        )}
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <div className="flex items-center justify-between gap-2 mb-1">
          {product.category && (
            <span className="font-label-sm text-[11px] text-amber-700 uppercase tracking-widest font-bold">
              {product.category.name}
            </span>
          )}
          <div className="flex items-center gap-1 text-amber-600 text-[11px] font-bold">
            <span>★</span>
            <span>4.9</span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1.5 group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="font-body-md text-xs text-on-surface-variant mb-5 grow line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-amber-900/10">
          <div>
            <span className="text-[11px] text-on-surface-variant font-medium block">
              {variant?.packSize ? `${variant.packSize} pack` : "Standard"}
            </span>
            <span className="font-body-lg text-lg font-bold text-amber-900">
              {variant ? `₹${variant.price}` : "—"}
            </span>
          </div>

          {variant && (
            isSoldOut ? (
              <button
                disabled
                className="bg-neutral-200 text-neutral-500 font-label-md text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl flex items-center gap-1 font-bold cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">remove_shopping_cart</span>
                <span>Sold Out</span>
              </button>
            ) : (
              <AddToCartButton variantId={variant.id} quantity={1} productName={product.name} />
            )
          )}
        </div>
      </div>
    </article>
  );
}
