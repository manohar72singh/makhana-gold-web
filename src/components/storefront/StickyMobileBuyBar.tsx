"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Variant = {
  id: number;
  packSize: string;
  price: string;
  compareAtPrice: string | null;
};

export function StickyMobileBuyBar({
  productName,
  imageUrl,
  variants,
  selectedVariantId,
  onSelectVariant,
  onAddToCart,
  onBuyNow,
  isPending,
  isSoldOut,
  added,
}: {
  productName: string;
  imageUrl?: string;
  variants: Variant[];
  selectedVariantId: number;
  onSelectVariant: (id: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isPending: boolean;
  isSoldOut: boolean;
  added: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Show sticky bar once user scrolls down > 380px on mobile
      if (window.scrollY > 380) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const currentVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const price = Number(currentVariant?.price ?? 0);

  return (
    <aside aria-label="Quick Mobile Checkout" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-900/15 p-3 px-4 shadow-[0_-8px_25px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Left: Thumbnail & Price */}
        <div className="flex items-center gap-2.5 min-w-0">
          {imageUrl && (
            <div className="relative w-11 h-11 rounded-xl bg-[#FAF6EE] overflow-hidden border border-amber-900/10 shrink-0">
              <Image src={imageUrl} alt={productName} fill sizes="44px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-on-surface truncate leading-tight">
              {productName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-extrabold text-sm text-[#D84315]">
                ₹{price.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                • {currentVariant?.packSize}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isSoldOut ? (
            <button
              disabled
              className="py-2.5 px-4 rounded-xl bg-neutral-200 text-neutral-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <>
              <button
                onClick={onAddToCart}
                disabled={isPending}
                className="py-2.5 px-3.5 rounded-xl bg-[#D84315] hover:bg-secondary text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {added ? "done" : "shopping_bag"}
                </span>
                <span>{added ? "Added!" : "Add"}</span>
              </button>

              <button
                onClick={onBuyNow}
                disabled={isPending}
                className="py-2.5 px-3 rounded-xl border-2 border-[#D84315] text-[#D84315] font-bold text-xs uppercase tracking-wider hover:bg-[#D84315]/5 transition-colors active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
