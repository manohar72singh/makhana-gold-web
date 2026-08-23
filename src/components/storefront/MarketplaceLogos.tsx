import React from "react";

/**
 * Clean, recognizable official icon logos for top marketplaces
 */

// Amazon Icon (Black/White with iconic orange smile arrow)
export function AmazonIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#232F3E] text-white p-1.5 shadow-2xs ${className}`}
      title="Amazon"
    >
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        {/* Amazon 'a' */}
        <text
          x="12"
          y="23"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="20"
          fill="#FFFFFF"
        >
          a
        </text>
        {/* Amazon curved smile arrow */}
        <path
          d="M10 26.5C16 30.5 24 30.5 30 25.5"
          stroke="#FF9900"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M31 23.5L30.5 27.5L27 26.5"
          fill="#FF9900"
        />
      </svg>
    </div>
  );
}

// Flipkart Icon (Iconic blue shopping bag with yellow 'f')
export function FlipkartIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#2874F0] text-[#FFE500] shadow-2xs p-1 ${className}`}
      title="Flipkart"
    >
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        {/* Bag Handle */}
        <path
          d="M13 14V11C13 8.2 15.2 6 18 6C20.8 6 23 8.2 23 11V14"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Shopping Bag Body */}
        <rect x="8" y="12" width="20" height="18" rx="3" fill="#2874F0" />
        {/* Flipkart 'f' italic */}
        <text
          x="14"
          y="26"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="18"
          fill="#FFE500"
        >
          f
        </text>
      </svg>
    </div>
  );
}

// Blinkit Icon (Yellow background with iconic green 'b')
export function BlinkitIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#F8CB46] text-[#0C831F] font-black text-xl shadow-2xs ${className}`}
      title="Blinkit"
    >
      <span className="font-extrabold text-[#0C831F] text-lg leading-none -mt-0.5">b</span>
    </div>
  );
}

// Zepto Icon (Vibrant purple background with white 'Z')
export function ZeptoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#7A1CAC] text-white font-black text-lg shadow-2xs ${className}`}
      title="Zepto"
    >
      <span className="font-black text-white text-base leading-none">Z</span>
    </div>
  );
}

// Swiggy Instamart Icon (Vibrant orange with white 'S' pin)
export function InstamartIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#FC8019] text-white shadow-2xs ${className}`}
      title="Swiggy Instamart"
    >
      <span className="material-symbols-outlined text-white text-lg">shopping_basket</span>
    </div>
  );
}
