"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured Collection" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "New Harvest First" },
];

function usePushParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };
}

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  children: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export function CategoryFilter({ categoryTree }: { categoryTree: CategoryNode[] }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const pushParams = usePushParams();

  const PILLAR_ICONS: Record<string, string> = {
    makhana: "👑",
    sattu: "🥣",
    poha: "🌾",
  };

  return (
    <>
      {/* 📱 Mobile Horizontal Master Pill Scroll */}
      <div className="lg:hidden flex overflow-x-auto gap-2 pb-3 mb-6 no-scrollbar w-full">
        <button
          onClick={() => pushParams({ category: null })}
          className={`px-4 py-2 rounded-full text-xs font-label-md shrink-0 transition-all font-bold ${
            !activeCategory
              ? "bg-[#D84315] text-white shadow-xs"
              : "bg-[#FAF6EE] text-amber-950 border border-amber-900/10"
          }`}
        >
          ✨ All Superfoods
        </button>
        {categoryTree.map((parent) => {
          const isParentActive =
            activeCategory === parent.slug ||
            parent.children.some((c) => c.slug === activeCategory);

          return (
            <button
              key={parent.slug}
              onClick={() => pushParams({ category: parent.slug })}
              className={`px-4 py-2 rounded-full text-xs font-label-md shrink-0 transition-all font-bold flex items-center gap-1.5 ${
                isParentActive
                  ? "bg-[#D84315] text-white shadow-xs"
                  : "bg-[#FAF6EE] text-amber-950 border border-amber-900/10"
              }`}
            >
              <span>{PILLAR_ICONS[parent.slug] || "📦"}</span>
              <span>{parent.name}</span>
            </button>
          );
        })}
      </div>

      {/* 💻 Desktop Hierarchical 3-Pillar Accordion Box */}
      <div className="hidden lg:block space-y-5 bg-white p-6 rounded-3xl border border-amber-900/10 shadow-warm-1">
        <div>
          <h3 className="font-headline-sm text-sm text-[#1C150C] mb-4 uppercase tracking-widest font-black flex items-center justify-between">
            <span>🌾 Categories</span>
            <button
              onClick={() => pushParams({ category: null })}
              className="text-[10px] text-amber-700 hover:underline lowercase font-semibold"
            >
              reset
            </button>
          </h3>

          <div className="space-y-4">
            {/* All Products Master Option */}
            <button
              onClick={() => pushParams({ category: null })}
              className={`w-full text-left py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-between font-bold ${
                !activeCategory
                  ? "bg-[#D84315] text-white shadow-xs"
                  : "hover:bg-[#FAF6EE] text-amber-950"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>✨</span>
                <span>All Superfoods Collection</span>
              </span>
              {!activeCategory && (
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              )}
            </button>

            {/* 3 Main Pillars with Nested Sub-categories */}
            {categoryTree.map((parent) => {
              const isDirectParentActive = activeCategory === parent.slug;
              const hasActiveChild = parent.children.some((c) => c.slug === activeCategory);
              const isExpanded = isDirectParentActive || hasActiveChild || true;

              return (
                <div key={parent.slug} className="rounded-2xl border border-amber-900/10 overflow-hidden bg-[#FAF6EE]/50">
                  {/* Pillar Main Button */}
                  <button
                    onClick={() => pushParams({ category: parent.slug })}
                    className={`w-full text-left py-2.5 px-3 transition-all flex items-center justify-between text-xs font-black ${
                      isDirectParentActive
                        ? "bg-[#D84315] text-white shadow-xs"
                        : "text-amber-950 hover:bg-[#FAF6EE]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{PILLAR_ICONS[parent.slug] || "📦"}</span>
                      <span>{parent.name}</span>
                    </span>
                    <span className="text-[10px] opacity-75">All →</span>
                  </button>

                  {/* Sub-categories List */}
                  {parent.children.length > 0 && isExpanded && (
                    <div className="p-2 space-y-1 bg-white border-t border-amber-900/10">
                      {parent.children.map((child) => {
                        const isChildActive = activeCategory === child.slug;

                        return (
                          <button
                            key={child.slug}
                            onClick={() => pushParams({ category: child.slug })}
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-[11px] transition-all flex items-center justify-between ${
                              isChildActive
                                ? "bg-amber-100 text-amber-950 font-bold"
                                : "text-[#5C4D3C] hover:bg-[#FAF6EE] hover:text-amber-950 font-medium"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{child.name}</span>
                            </span>
                            {isChildActive && (
                              <span className="material-symbols-outlined text-[14px] text-[#D84315]">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Badges */}
        <div className="pt-4 border-t border-amber-900/10 text-xs text-amber-900/80 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <span className="material-symbols-outlined text-amber-700 text-sm">verified</span>
            <span>100% Wetland &amp; Cold Stone-Ground</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <span className="material-symbols-outlined text-amber-700 text-sm">local_shipping</span>
            <span>Pan-India Direct Express Dispatch</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function SortSelect() {
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") ?? "featured";
  const pushParams = usePushParams();

  return (
    <div className="flex items-center gap-2">
      <label className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant shrink-0" htmlFor="sort">
        Sort By:
      </label>
      <select
        id="sort"
        value={activeSort}
        onChange={(e) => pushParams({ sort: e.target.value === "featured" ? null : e.target.value })}
        className="bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-xs rounded-xl px-3 py-2 focus:ring-primary focus:border-primary shadow-xs font-semibold"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
