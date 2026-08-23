"use client";

import { useState } from "react";
import Link from "next/link";

export function CouponCard({
  code,
  type,
  value,
  minOrderValue,
}: {
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-500/60 transition-colors">
      <div>
        <span className="inline-block bg-amber-500/15 text-amber-900 font-label-sm text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md mb-2 border border-amber-500/30">
          {type === "percent" ? "Percentage Discount" : "Flat Discount"}
        </span>
        <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1">
          {type === "percent" ? `${value}% Off Total Order` : `₹${value} Flat Off`}
        </h3>
        <p className="font-body-md text-xs text-on-surface-variant">
          {minOrderValue > 0
            ? `Applicable on orders above ₹${minOrderValue}`
            : "No minimum purchase requirement"}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="font-mono font-bold text-sm bg-amber-500/15 text-amber-950 border border-amber-500/40 px-3.5 py-2 rounded-xl tracking-wider select-all">
          {code}
        </span>
        <button
          onClick={copyCode}
          className="bg-surface-container hover:bg-amber-800 hover:text-white text-on-surface px-4 py-2 rounded-xl text-xs font-label-md uppercase tracking-wider transition-colors cursor-pointer shrink-0 font-bold"
        >
          {copied ? "Copied! ✓" : "Copy"}
        </button>
        <Link
          href="/cart"
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
          className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-label-md uppercase tracking-wider transition-all shrink-0 font-bold shadow-xs"
        >
          Use Code
        </Link>
      </div>
    </div>
  );
}
