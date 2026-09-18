"use client";

import { WHOLESALE_TIERS, getTierForQuantity, calculateTierPrice } from "@/lib/pricing";

export function WholesaleVolumeTiers({
  basePrice,
  currentQuantity,
  onSelectQuantity,
}: {
  basePrice: number;
  currentQuantity: number;
  onSelectQuantity: (qty: number) => void;
}) {
  const activeTier = getTierForQuantity(currentQuantity);

  return (
    <div className="mb-5 p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/15">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#D84315]">inventory_2</span>
          <span className="font-label-md text-xs text-[#1C150C] font-bold uppercase tracking-wider">
            Wholesale &amp; Bulk Volume Pricing
          </span>
        </div>
        {activeTier.discountPercent > 0 ? (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider animate-pulse">
            ⚡ {activeTier.badge} Unlocked
          </span>
        ) : (
          <span className="text-[10px] text-amber-900/70 font-semibold">
            Order 10+ for wholesale rates
          </span>
        )}
      </div>

      {/* 4-Column Tier Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WHOLESALE_TIERS.map((tier) => {
          const isActive = activeTier.id === tier.id;
          const tierUnitPrice = calculateTierPrice(basePrice, tier.minQty);

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectQuantity(tier.minQty)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-white border-[#D84315] ring-2 ring-[#D84315]/30 shadow-xs"
                  : "bg-white/70 border-amber-900/10 hover:border-amber-400 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase">
                    {tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`} Packs
                  </span>
                  {tier.discountPercent > 0 && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      -{tier.discountPercent}%
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-xs text-[#1C150C]">
                  ₹{tierUnitPrice.toFixed(0)}
                  <span className="text-[9px] font-normal text-neutral-500">/ea</span>
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-amber-900/10 flex items-center justify-between">
                <span className="text-[9px] text-amber-950/70 font-medium truncate">
                  {tier.name}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D84315] shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {activeTier.discountPercent > 0 && (
        <p className="text-[11px] text-emerald-800 font-medium mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
          <span>
            Wholesale Tier Applied: ₹{calculateTierPrice(basePrice, currentQuantity).toFixed(0)}/pack (You save {activeTier.discountPercent}% on this quantity)
          </span>
        </p>
      )}
    </div>
  );
}
