"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(storefront)/cart/actions";
import { dispatchCartAdded } from "./CartToast";
import {
  AmazonIcon,
  FlipkartIcon,
  BlinkitIcon,
  ZeptoIcon,
  InstamartIcon,
} from "./MarketplaceLogos";
import { PincodeChecker } from "./PincodeChecker";
import { StickyMobileBuyBar } from "./StickyMobileBuyBar";

type Variant = {
  id: number;
  packSize: string;
  price: string;
  compareAtPrice: string | null;
  stockQuantity?: number;
  inventoryStock?: { quantityOnHand: number }[];
};

type ProductImage = {
  url: string;
  altText: string | null;
};

export function ProductPurchasePanel({
  productName,
  description,
  badge,
  images,
  variants,
  reviewCount = 0,
  avgRating = 5.0,
}: {
  productName: string;
  description: string | null;
  badge?: string | null;
  images: ProductImage[];
  variants: Variant[];
  reviewCount?: number;
  avgRating?: number;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  // Calculate current selected variant stock
  const currentStock = selectedVariant?.inventoryStock
    ? selectedVariant.inventoryStock.reduce((sum, s) => sum + s.quantityOnHand, 0)
    : selectedVariant?.stockQuantity ?? 100;

  const isSoldOut = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 10;

  const currentPrice = Number(selectedVariant?.price ?? 0);
  const comparePrice = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : null;
  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  function handleAddToCart() {
    if (!selectedVariant || isSoldOut) return;
    const formData = new FormData();
    formData.set("variantId", String(selectedVariant.id));
    formData.set("quantity", String(quantity));
    startTransition(async () => {
      await addToCartAction(formData);
      setAdded(true);
      dispatchCartAdded({ name: productName });
      router.refresh();
      setTimeout(() => setAdded(false), 2000);
    });
  }

  function handleBuyNow() {
    if (!selectedVariant || isSoldOut) return;
    const formData = new FormData();
    formData.set("variantId", String(selectedVariant.id));
    formData.set("quantity", String(quantity));
    startTransition(async () => {
      await addToCartAction(formData);
      router.push("/checkout");
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start w-full">
      {/* 1. Left Gallery */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Main Hero Shot */}
        <div className="relative w-full h-[300px] sm:h-[380px] md:h-[460px] bg-[#FAF6EE] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-900/10 shadow-ambient">
          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {isSoldOut ? (
              <span className="bg-neutral-900 text-white font-label-sm text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-neutral-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-amber-950 font-label-sm text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md animate-pulse border border-amber-600">
                🔥 Low Stock: Only {currentStock} Left
              </span>
            ) : badge ? (
              <span className="bg-[#E64A19] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {badge}
              </span>
            ) : null}
          </div>

          {images[activeImage] && (
            <Image
              src={images[activeImage].url}
              alt={images[activeImage].altText ?? productName}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              priority
              className={`object-cover transition-opacity duration-300 ${
                isSoldOut ? "grayscale-[50%] opacity-85" : ""
              }`}
            />
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-[#FAF6EE] ${
                  activeImage === idx
                    ? "border-primary shadow-xs scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Sticky Purchasing Form */}
      <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-amber-900/10 shadow-warm-1">
        {/* Rating & Review Counter */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center text-amber-500 text-sm font-bold">
            <span>★</span>
            <span className="ml-1 text-on-surface font-body-sm text-xs font-semibold">
              {avgRating.toFixed(1)}
            </span>
          </div>
          <span className="text-outline text-xs">•</span>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            {reviewCount} Verified Harvest Reviews
          </span>
        </div>

        {/* Title */}
        <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface mb-2 leading-tight">
          {productName}
        </h1>

        {/* Short Description */}
        {description && (
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mb-4 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {/* Price Box */}
        <div className="flex items-baseline gap-3 mb-4 p-3.5 bg-[#FAF6EE] rounded-xl border border-amber-900/10">
          <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-primary">
            ₹{currentPrice.toFixed(2)}
          </span>
          {comparePrice && comparePrice > currentPrice && (
            <>
              <span className="font-body-md text-sm text-on-surface-variant line-through">
                ₹{comparePrice.toFixed(2)}
              </span>
              {discountPercent && (
                <span className="bg-[#E64A19]/10 text-[#E64A19] text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Save {discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* 🟢 DYNAMIC INVENTORY STATUS PILL */}
        <div className="mb-5">
          {isSoldOut ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              <span>Temporarily Out of Stock — New harvest roasting soon!</span>
            </div>
          ) : isLowStock ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between text-amber-900 text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  Hurry, only {currentStock} pack(s) remaining!
                </span>
                <span className="text-[10px] text-amber-700 uppercase font-extrabold">Low Stock</span>
              </div>
              <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentStock / 10) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>In Stock • Ready for Pan-India Express Dispatch</span>
            </div>
          )}
        </div>

        {/* Variant / Pack Size Selector */}
        <div className="mb-5">
          <label className="block font-label-md text-xs text-primary font-bold uppercase tracking-wider mb-2">
            Select Pack Weight
          </label>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariant?.id;
              const isBestValue = v.packSize.includes("500") || v.packSize.includes("Gift");
              const vStock = v.inventoryStock
                ? v.inventoryStock.reduce((sum, s) => sum + s.quantityOnHand, 0)
                : v.stockQuantity ?? 100;
              const vSoldOut = vStock === 0;

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl font-label-md text-xs uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? "border-2 border-primary bg-primary/5 text-primary font-bold shadow-xs"
                      : vSoldOut
                      ? "border border-gray-200 text-gray-400 bg-gray-50 opacity-75"
                      : "border border-outline-variant/60 text-on-surface-variant hover:border-primary/40 bg-surface-container-lowest"
                  }`}
                >
                  <span>{v.packSize}</span>
                  {vSoldOut ? (
                    <span className="text-[9px] text-red-600 font-bold lowercase">
                      sold out
                    </span>
                  ) : isBestValue ? (
                    <span className="text-[9px] text-tertiary font-semibold lowercase">
                      best value
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Stepper */}
        {!isSoldOut && (
          <div className="mb-5 flex items-center gap-4">
            <span className="font-label-md text-xs text-primary font-bold uppercase tracking-wider">
              Quantity
            </span>
            <div className="flex items-center border border-outline-variant/60 rounded-xl bg-surface-container-lowest overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2.5 text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-label-md text-sm font-bold w-8 text-center text-on-surface">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                className="px-3.5 py-2.5 text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        )}

        {/* Pincode Estimator */}
        <PincodeChecker />

        {/* Dual CTAs — full width */}
        <div className="flex flex-col gap-3 mb-6">
          {isSoldOut ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-neutral-200 text-neutral-500 font-label-md text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">remove_shopping_cart</span>
              <span>Temporarily Sold Out</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={pending}
                className={`w-full py-4 rounded-xl text-white font-label-md text-sm uppercase tracking-wider transition-all duration-300 shadow-warm-1 hover:shadow-warm-2 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 font-bold ${
                  added ? "bg-emerald-600 scale-101" : "bg-[#D84315] hover:bg-secondary"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    pending ? "animate-spin" : added ? "animate-badge-pop" : ""
                  }`}
                >
                  {pending ? "progress_activity" : added ? "check_circle" : "shopping_cart_checkout"}
                </span>
                <span>{pending ? "Adding…" : added ? "Item Added To Bag!" : "Add to Cart"}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={pending}
                className="w-full py-3.5 rounded-xl border-2 border-primary-container text-primary font-label-md text-sm uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer disabled:opacity-60 font-bold"
              >
                Buy Now With 1-Click
              </button>
            </>
          )}
        </div>

        {/* Multi-Channel Retailer Availability */}
        <div className="mb-5 pt-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px bg-amber-900/10 flex-1" />
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-amber-800 tracking-wider whitespace-nowrap">
              Also Available On
            </span>
            <div className="h-px bg-amber-900/10 flex-1" />
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <AmazonIcon />
            <FlipkartIcon />
            <BlinkitIcon />
            <ZeptoIcon />
            <InstamartIcon />
          </div>
        </div>

        {/* Guarantee Badges */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-amber-900/10 text-center">
          <div>
            <span className="material-symbols-outlined text-amber-800 text-lg mb-0.5">
              eco
            </span>
            <p className="text-[10px] font-bold text-on-surface uppercase">
              100% Wetland
            </p>
          </div>
          <div>
            <span className="material-symbols-outlined text-amber-800 text-lg mb-0.5">
              verified
            </span>
            <p className="text-[10px] font-bold text-on-surface uppercase">
              Zero Palm Oil
            </p>
          </div>
          <div>
            <span className="material-symbols-outlined text-amber-800 text-lg mb-0.5">
              local_shipping
            </span>
            <p className="text-[10px] font-bold text-on-surface uppercase">
              Pan-India Fast
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <StickyMobileBuyBar
        productName={productName}
        imageUrl={images[0]?.url}
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelectVariant={(id) => setSelectedVariantId(id)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isPending={pending}
        isSoldOut={isSoldOut}
        added={added}
      />
    </div>
  );
}
