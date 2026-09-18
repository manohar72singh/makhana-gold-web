"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addBulkToCartAction } from "@/app/(storefront)/cart/actions";
import { dispatchCartAdded } from "@/components/storefront/CartToast";
import {
  WHOLESALE_TIERS,
  WholesaleTier,
  getTierForQuantity,
  calculateTierPrice,
} from "@/lib/pricing";

export interface B2BVariant {
  id: number;
  packSize: string;
  price: string;
  compareAtPrice: string | null;
  weightGrams?: number | null;
}

export interface B2BProductItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category?: { name: string; slug: string } | null;
  images: { url: string; altText: string | null }[];
  variants: B2BVariant[];
}

// ─── Tier chip colors ───────────────────────────────────────────────────────
const TIER_COLORS: Record<number, { ring: string; bg: string; text: string; dot: string }> = {
  1: { ring: "ring-neutral-200",    bg: "bg-neutral-50",   text: "text-neutral-600",  dot: "bg-neutral-400" },
  2: { ring: "ring-amber-300",      bg: "bg-amber-50",     text: "text-amber-800",    dot: "bg-amber-500" },
  3: { ring: "ring-orange-400",     bg: "bg-orange-50",    text: "text-orange-800",   dot: "bg-orange-500" },
  4: { ring: "ring-emerald-400",    bg: "bg-emerald-50",   text: "text-emerald-800",  dot: "bg-emerald-600" },
};

export function BulkOrderSheetClient({
  products,
  supportWhatsapp = "916001684216",
}: {
  products: B2BProductItem[];
  supportWhatsapp?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlySelected, setOnlySelected] = useState(false);
  const [showGstDetails, setShowGstDetails] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const toggleProduct = (productId: number) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Unique categories
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const p of products) {
      if (p.category) {
        const e = map.get(p.category.slug) || { name: p.category.name, count: 0 };
        e.count += 1;
        map.set(p.category.slug, e);
      }
    }
    return Array.from(map.entries()).map(([slug, d]) => ({ slug, name: d.name, count: d.count }));
  }, [products]);

  const handleQtyChange = (variantId: number, value: number) => {
    const safe = Math.max(0, isNaN(value) ? 0 : value);
    setQuantities((prev) => {
      const next = { ...prev };
      if (safe === 0) delete next[variantId];
      else next[variantId] = safe;
      return next;
    });
  };

  const handlePreset = (variantId: number, count: number) =>
    setQuantities((prev) => ({ ...prev, [variantId]: (prev[variantId] || 0) + count }));

  // Aggregate calculations
  const calc = useMemo(() => {
    let totalUnits = 0;
    let totalRegular = 0;
    const items: { product: B2BProductItem; variant: B2BVariant; quantity: number; base: number }[] = [];

    for (const p of products) {
      for (const v of p.variants) {
        const qty = quantities[v.id] || 0;
        if (qty > 0) {
          const base = Number(v.price);
          totalUnits += qty;
          totalRegular += base * qty;
          items.push({ product: p, variant: v, quantity: qty, base });
        }
      }
    }

    const tier = getTierForQuantity(totalUnits);
    const tierIdx = WHOLESALE_TIERS.findIndex((t) => t.id === tier.id);
    const nextTier: WholesaleTier | null = tierIdx < WHOLESALE_TIERS.length - 1 ? WHOLESALE_TIERS[tierIdx + 1] : null;

    let totalEffective = 0;
    for (const item of items) {
      totalEffective += calculateTierPrice(item.base, totalUnits) * item.quantity;
    }

    return {
      totalUnits,
      totalRegular,
      totalEffective,
      totalSavings: Math.max(0, totalRegular - totalEffective),
      tier,
      nextTier,
      items,
      skuCount: items.length,
      progress: nextTier
        ? Math.min(100, Math.max(4, ((totalUnits - tier.minQty) / (nextTier.minQty - tier.minQty)) * 100))
        : 100,
    };
  }, [products, quantities]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (onlySelected && !p.variants.some((v) => (quantities[v.id] || 0) > 0)) return false;
      const q = searchQuery.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !(p.category?.name.toLowerCase().includes(q))) return false;
      if (selectedCategory !== "all" && p.category?.slug !== selectedCategory) return false;
      return true;
    });
    return list;
  }, [products, searchQuery, selectedCategory, onlySelected, quantities]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, onlySelected]);

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const handleAddToCart = () => {
    if (!calc.items.length) { setErrorMessage("Select at least one product to add."); return; }
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await addBulkToCartAction(calc.items.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })));
        dispatchCartAdded({ name: `Bulk Order (${calc.totalUnits} packs)` });
        setSuccessMessage(`${calc.totalUnits} packs added to cart across ${calc.skuCount} SKUs.`);
        router.refresh();
      } catch (e: any) { setErrorMessage(e?.message || "Failed to add to cart."); }
    });
  };

  const waUrl = useMemo(() => {
    if (!calc.items.length) return "#";
    const lines = ["💼 *B2B PROCUREMENT INQUIRY — Makhana Gold*", ""];
    calc.items.forEach((item, i) => {
      const eu = calculateTierPrice(item.base, calc.totalUnits);
      lines.push(`${i + 1}. *${item.product.name}* [${item.variant.packSize}] × ${item.quantity} = ₹${(eu * item.quantity).toFixed(0)}`);
    });
    lines.push(`\n📦 *Total:* ${calc.totalUnits} packs | ⚡ *Tier:* ${calc.tier.name} (${calc.tier.badge}) | 💰 *Value:* ₹${calc.totalEffective.toFixed(0)}`);
    if (companyName) lines.push(`🏢 ${companyName}`);
    if (gstin) lines.push(`📑 GSTIN: ${gstin.toUpperCase()}`);
    return `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [calc, companyName, gstin, supportWhatsapp]);

  return (
    <div className="w-full pb-24">

      {/* ── TIER SLAB STRIP (compact horizontal) ─────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {WHOLESALE_TIERS.map((tier) => {
          const active = calc.tier.id === tier.id;
          const c = TIER_COLORS[tier.id];
          return (
            <div
              key={tier.id}
              className={`relative p-3.5 rounded-2xl border transition-all ${active ? `ring-2 ${c.ring} ${c.bg} shadow-sm` : "bg-white border-neutral-100"}`}
            >
              {active && (
                <span className={`absolute -top-2 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-[#D84315] shadow-xs`}>
                  Active
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className="text-[10px] font-black text-neutral-800 uppercase tracking-wider">{tier.name}</span>
              </div>
              <div className="text-lg font-black text-[#1C150C]">
                {tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`}
                <span className="text-xs font-normal text-neutral-400 ml-1">packs</span>
              </div>
              <div className={`text-xs font-extrabold mt-0.5 ${c.text}`}>
                {tier.discountPercent > 0 ? `${tier.discountPercent}% OFF` : "Retail Rate"}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PROGRESS BAR (only if not max tier) ─────────────────────────── */}
      {calc.nextTier && (
        <div className="mb-5 px-4 py-3 bg-white rounded-2xl border border-neutral-100 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 mb-1.5">
              <span>
                Add <strong className="text-[#D84315]">{calc.nextTier.minQty - calc.totalUnits} more packs</strong> → unlock <strong className="text-emerald-700">{calc.nextTier.name} ({calc.nextTier.badge})</strong>
              </span>
              <span className="text-neutral-400">{calc.totalUnits}/{calc.nextTier.minQty}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-linear-to-r from-amber-500 to-[#D84315] h-full rounded-full transition-all duration-500" style={{ width: `${calc.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ──────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 font-medium placeholder-neutral-400 focus:outline-none focus:border-[#D84315] focus:ring-1 focus:ring-[#D84315]/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer">✕</button>
          )}
        </div>

        {/* Category pills (scrollable row) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
          {[{ slug: "all", name: "All", count: products.length }, ...categories].map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.slug
                  ? "bg-[#D84315] text-white shadow-xs"
                  : "bg-white border border-neutral-200 text-neutral-700 hover:border-amber-400"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Selected toggle */}
        {calc.skuCount > 0 && (
          <button
            type="button"
            onClick={() => setOnlySelected(!onlySelected)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${onlySelected ? "bg-amber-950 text-white" : "bg-white border border-neutral-200 text-neutral-700"}`}
          >
            <span className="material-symbols-outlined text-[14px]">{onlySelected ? "check_circle" : "tune"}</span>
            Selected ({calc.skuCount})
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            {successMessage}
          </div>
          <Link href="/cart" className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-extrabold hover:bg-emerald-800 transition-colors">
            View Cart →
          </Link>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
          {errorMessage}
        </div>
      )}

      {/* ── PRODUCT TABLE ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs">
        {/* Table header (hidden on mobile) */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 text-[10px] font-black text-neutral-500 uppercase tracking-wider">
          <div className="col-span-5">Product / Pack</div>
          <div className="col-span-2 text-right">MRP</div>
          <div className="col-span-2 text-right">Wholesale Rate</div>
          <div className="col-span-3 text-right">Quantity</div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-sm font-bold text-neutral-400">
            No products found.{" "}
            <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setOnlySelected(false); }} className="text-[#D84315] hover:underline cursor-pointer">Clear filters</button>
          </div>
        )}

        <div className="divide-y divide-neutral-100">
          {paginatedProducts.map((product) => {
            const img = product.images[0]?.url || "/images/vibrant/hero.jpg";
            const productQty = product.variants.reduce((s, v) => s + (quantities[v.id] || 0), 0);
            const isExpanded = expandedProducts.has(product.id);

            return (
              <div key={product.id}>
                {/* ── Accordion Header Row ───────────────────────── */}
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full grid grid-cols-12 gap-x-3 items-center px-4 sm:px-5 py-3.5 text-left transition-colors cursor-pointer ${
                    productQty > 0
                      ? "bg-amber-50 hover:bg-amber-100/60"
                      : "bg-white hover:bg-neutral-50"
                  }`}
                >
                  {/* col 1-5: Thumbnail + Product name + variant count */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#FAF6EE] shrink-0 shadow-xs">
                      <Image src={img} alt={product.name} fill className="object-cover" sizes="36px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] sm:text-[13px] font-black text-amber-950 leading-tight line-clamp-1">
                          {product.name}
                        </span>
                        {productQty > 0 && (
                          <span className="shrink-0 text-[10px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded-full">
                            {productQty}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {product.category && (
                          <span className="text-[10px] font-bold text-[#D84315]/80 uppercase tracking-wide">
                            {product.category.name}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-medium">
                          · {product.variants.length} {product.variants.length === 1 ? "variant" : "variants"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* col 6-7: Price range */}
                  <div className="col-span-2 text-right">
                    <span className="text-[11px] font-semibold text-neutral-500">
                      ₹{Math.min(...product.variants.map((v) => Number(v.price)))}
                      {product.variants.length > 1 &&
                        ` – ₹${Math.max(...product.variants.map((v) => Number(v.price)))}`}
                    </span>
                  </div>

                  {/* col 8-9: Wholesale range */}
                  <div className="col-span-2 text-right">
                    <span className="text-[11px] font-black text-amber-950">
                      ₹{Math.round(calculateTierPrice(
                          Math.min(...product.variants.map((v) => Number(v.price))),
                          calc.totalUnits
                        ))}
                      {product.variants.length > 1 && ` – ₹${Math.round(calculateTierPrice(
                          Math.max(...product.variants.map((v) => Number(v.price))),
                          calc.totalUnits
                        ))}`}
                    </span>
                  </div>

                  {/* col 10-12: Expand chevron */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    {productQty > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {productQty} packs
                      </span>
                    )}
                    <span
                      className={`material-symbols-outlined text-[18px] text-neutral-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {/* ── Variant Rows (collapsible) ─────────────────── */}
                {isExpanded && (
                  <div className="divide-y divide-neutral-50/80 border-t border-neutral-100 bg-neutral-50/40">
                    {product.variants.map((variant) => {
                      const base = Number(variant.price);
                      const qty = quantities[variant.id] || 0;
                      const eu = calculateTierPrice(base, calc.totalUnits);
                      const savings = (base - eu) * qty;

                      return (
                        <div
                          key={variant.id}
                          className={`grid grid-cols-12 gap-x-3 items-center pl-16 pr-4 sm:pr-5 py-3 transition-colors ${
                            qty > 0 ? "bg-amber-50/60" : "hover:bg-white/80"
                          }`}
                        >
                          {/* col 1-5: Pack label (indented under product) */}
                          <div className="col-span-5 flex items-center gap-2 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-neutral-700 text-[11px] font-bold border border-neutral-200 shrink-0 shadow-2xs">
                              {variant.packSize}
                            </span>
                            {qty > 0 && savings > 0 && (
                              <span className="text-[10px] font-extrabold text-emerald-700 whitespace-nowrap">
                                Saved ₹{savings.toFixed(0)}
                              </span>
                            )}
                          </div>

                          {/* col 6-7: MRP */}
                          <div className="col-span-2 text-right">
                            <span className={`text-xs font-semibold ${
                              calc.tier.discountPercent > 0
                                ? "text-neutral-400 line-through"
                                : "text-neutral-700 font-bold"
                            }`}>
                              ₹{base}
                            </span>
                          </div>

                          {/* col 8-9: Wholesale Rate */}
                          <div className="col-span-2 text-right">
                            <div className="text-sm font-black text-amber-950">₹{eu.toFixed(0)}</div>
                            {calc.tier.discountPercent > 0 && (
                              <div className="text-[9px] font-black text-emerald-700">-{calc.tier.discountPercent}%</div>
                            )}
                          </div>

                          {/* col 10-12: Stepper */}
                          <div className="col-span-3 flex flex-col items-end gap-1">
                            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(variant.id, qty - 1)}
                                disabled={qty === 0}
                                className="px-2 py-1.5 text-neutral-500 hover:text-amber-950 hover:bg-neutral-100 disabled:opacity-25 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">remove</span>
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={999}
                                value={qty === 0 ? "" : qty}
                                placeholder="0"
                                onChange={(e) => handleQtyChange(variant.id, parseInt(e.target.value, 10))}
                                className="w-10 text-center font-bold text-xs text-amber-950 focus:outline-none bg-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => handleQtyChange(variant.id, qty + 1)}
                                className="px-2 py-1.5 text-neutral-500 hover:text-amber-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              {[10, 25, 50].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => handlePreset(variant.id, n)}
                                  className="px-1.5 py-0.5 rounded-md bg-neutral-100 hover:bg-amber-100 text-neutral-600 hover:text-amber-900 text-[9px] font-extrabold transition-colors cursor-pointer"
                                >
                                  +{n}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PAGINATION ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50">
            <span className="text-[11px] font-bold text-neutral-500">
              Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200 bg-white text-neutral-500 hover:border-amber-400 hover:text-amber-900 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                    page === safePage
                      ? "bg-[#D84315] text-white shadow-sm"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-900"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200 bg-white text-neutral-500 hover:border-amber-400 hover:text-amber-900 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY EXECUTIVE DOCK ────────────────────────────────────────── */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A120A]/96 backdrop-blur-xl border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Order Summary */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">Order Total</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${TIER_COLORS[calc.tier.id].bg.replace("bg-", "bg-")} ${TIER_COLORS[calc.tier.id].text} border-current/20`}>
                  ⚡ {calc.tier.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black">₹{calc.totalEffective.toFixed(0)}</span>
                {calc.totalSavings > 0 && (
                  <>
                    <span className="text-xs text-neutral-400 line-through">₹{calc.totalRegular.toFixed(0)}</span>
                    <span className="text-xs font-black text-emerald-400">Save ₹{calc.totalSavings.toFixed(0)}</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-neutral-400 font-medium">
                {calc.totalUnits} packs · {calc.skuCount} SKUs · HSN 19041090
              </div>
            </div>

            {/* GSTIN toggle */}
            <button
              type="button"
              onClick={() => setShowGstDetails(!showGstDetails)}
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">{showGstDetails ? "expand_less" : "add_business"}</span>
              GSTIN
            </button>

            {/* WhatsApp Quote */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all ${
                calc.totalUnits > 0 ? "bg-[#25D366] text-black hover:bg-[#20bd5a] cursor-pointer shadow-md" : "bg-neutral-800 text-neutral-500 pointer-events-none opacity-40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="hidden sm:inline">WhatsApp Quote</span>
              <span className="sm:hidden">Quote</span>
            </a>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={pending || calc.totalUnits === 0}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                calc.totalUnits > 0 ? "bg-linear-to-r from-[#E64A19] to-[#D84315] text-white hover:brightness-110 shadow-lg" : "bg-neutral-800 text-neutral-500 pointer-events-none opacity-40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{pending ? "hourglass_top" : "shopping_cart_checkout"}</span>
              <span className="hidden sm:inline">{pending ? "Adding..." : `Add ${calc.totalUnits > 0 ? calc.totalUnits : ""} Packs to Cart`}</span>
              <span className="sm:hidden">{pending ? "..." : "Add to Cart"}</span>
            </button>
          </div>

          {/* GSTIN expand row */}
          {showGstDetails && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2 animate-in fade-in">
              <input
                type="text"
                placeholder="Company / Firm Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="15-Digit GSTIN for ITC Invoice"
                value={gstin}
                maxLength={15}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
