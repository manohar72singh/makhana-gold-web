import Link from "next/link";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF6EE]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-warm-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
            <span>404 • Page Not Found</span>
          </div>

          {/* Headline */}
          <h1 className="font-display-lg text-2xl sm:text-3xl text-[#1C150C] font-extrabold tracking-tight mb-2">
            Lost in the Wetlands
          </h1>

          {/* Short Subtitle */}
          <p className="font-body-md text-xs sm:text-sm text-[#594D3B] leading-relaxed mb-6 font-medium">
            The page you are seeking does not exist or has been moved to a new harvest trail.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-1/2 bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">home</span>
              <span>Back Home</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-1/2 border border-amber-900/20 hover:border-amber-700 bg-white text-[#1C150C] text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Shop All</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
