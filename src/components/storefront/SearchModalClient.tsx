"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchLiveProductsAction } from "@/app/(storefront)/search/actions";
import { addToCartAction } from "@/app/(storefront)/cart/actions";
import { dispatchCartAdded } from "./CartToast";

interface SearchProduct {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  categoryName: string;
  imageUrl: string;
  variantId: number;
  packSize: string;
  price: number;
}

const TRENDING_SEARCHES = [
  "Himalayan Pink Salt",
  "Fiery Peri Peri",
  "Truffle Parmesan",
  "Heritage Gift Bundle",
  "Roasted Ghee",
];

export function SearchModalClient({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle ESC key and focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults([]);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchLiveProductsAction(query);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function handleQuickAdd(variantId: number, productId: number, productName: string) {
    const formData = new FormData();
    formData.set("variantId", String(variantId));
    formData.set("quantity", "1");

    startTransition(async () => {
      await addToCartAction(formData);
      setAddedId(productId);
      dispatchCartAdded({ name: productName });
      router.refresh();
      setTimeout(() => setAddedId(null), 1500);
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Modal Canvas */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden z-10 animate-scaleUp max-h-[88vh] flex flex-col">
        {/* Search Header Input */}
        <div className="p-4 sm:p-6 border-b border-amber-900/10 flex items-center gap-3 bg-[#FAF6EE]">
          <span className="material-symbols-outlined text-amber-800 text-2xl shrink-0">
            search
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artisanal flavours, ingredients, pack sizes..."
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-[#1C150C] placeholder:text-on-surface-variant/60 focus:outline-none"
          />

          {isLoading && (
            <div className="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin shrink-0" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-on-surface-variant hover:text-primary text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-8 h-8 rounded-full bg-white border border-amber-900/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-amber-50 transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. When User Has Typed A Query */}
          {query.trim() ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Matching Flavours ({results.length})
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs text-amber-800 hover:text-[#E64A19] font-bold inline-flex items-center gap-1"
                >
                  <span>View All Results</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {results.length === 0 && !isLoading ? (
                <div className="p-8 text-center bg-[#FAF6EE] rounded-2xl border border-amber-900/10">
                  <span className="material-symbols-outlined text-3xl text-amber-700 mb-2">
                    sentiment_dissatisfied
                  </span>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Try searching for <button onClick={() => setQuery("Pink Salt")} className="text-amber-800 underline font-bold">Pink Salt</button>, <button onClick={() => setQuery("Peri Peri")} className="text-amber-800 underline font-bold">Peri Peri</button>, or <button onClick={() => setQuery("Truffle")} className="text-amber-800 underline font-bold">Truffle</button>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((product) => {
                    const isJustAdded = addedId === product.id;

                    return (
                      <div
                        key={product.id}
                        className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-amber-900/10 hover:border-amber-400 hover:bg-white transition-all flex items-center justify-between gap-3 group"
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-amber-900/10 shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block truncate">
                              {product.categoryName}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-on-surface truncate group-hover:text-amber-800 transition-colors">
                              {product.name}
                            </h4>
                            <span className="font-mono font-bold text-xs text-amber-950">
                              ₹{product.price}
                            </span>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product.variantId, product.id, product.name)}
                          className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold font-label-md uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 flex items-center gap-1 ${
                            isJustAdded
                              ? "bg-emerald-600 text-white scale-105"
                              : "bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white shadow-xs"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] ${isJustAdded ? "animate-badge-pop" : ""}`}
                          >
                            {isJustAdded ? "check" : "add_shopping_cart"}
                          </span>
                          <span className="hidden sm:inline">
                            {isJustAdded ? "Added" : "Add"}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* 2. Zero State: Trending & Popular Collections */
            <div className="space-y-6">
              {/* Trending Searches */}
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#E64A19]">
                    local_fire_department
                  </span>
                  <span>Trending Flavours</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 rounded-full bg-[#FAF6EE] border border-amber-900/10 text-xs font-semibold text-amber-950 hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Collection Shortcuts */}
              <div className="pt-4 border-t border-amber-900/10">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
                  Browse By Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Link
                    href="/shop?category=roasted-makhana"
                    onClick={onClose}
                    className="p-3 rounded-2xl bg-[#FAF6EE] hover:bg-amber-500/10 border border-amber-900/10 hover:border-amber-400 transition-all block text-center"
                  >
                    <span className="material-symbols-outlined text-amber-700 text-2xl mb-1 block">
                      eco
                    </span>
                    <span className="text-xs font-bold text-on-surface block">
                      Pure Ghee Roasted
                    </span>
                  </Link>

                  <Link
                    href="/shop?category=flavoured-makhana"
                    onClick={onClose}
                    className="p-3 rounded-2xl bg-[#FAF6EE] hover:bg-amber-500/10 border border-amber-900/10 hover:border-amber-400 transition-all block text-center"
                  >
                    <span className="material-symbols-outlined text-amber-700 text-2xl mb-1 block">
                      restaurant_menu
                    </span>
                    <span className="text-xs font-bold text-on-surface block">
                      Gourmet Flavours
                    </span>
                  </Link>

                  <Link
                    href="/offers"
                    onClick={onClose}
                    className="p-3 rounded-2xl bg-[#FAF6EE] hover:bg-amber-500/10 border border-amber-900/10 hover:border-amber-400 transition-all block text-center col-span-2 sm:col-span-1"
                  >
                    <span className="material-symbols-outlined text-amber-700 text-2xl mb-1 block">
                      featured_seasonal_and_gifts
                    </span>
                    <span className="text-xs font-bold text-on-surface block">
                      Gift Hampers
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Shortcut Note */}
        <div className="p-3 bg-[#FAF6EE] border-t border-amber-900/10 text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-4">
          <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-amber-900/20 font-mono text-[10px] shadow-xs">ESC</kbd> to exit</span>
          <span>✨ 100% Certified Bihar Wetland Makhana</span>
        </div>
      </div>
    </div>
  );
}
