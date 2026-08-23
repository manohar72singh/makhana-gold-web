import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import { CorporateGiftingFormClient } from "./CorporateGiftingFormClient";

export const metadata: Metadata = {
  title: "Corporate Gifting & Bulk Orders | Makhana Gold",
  description:
    "Elevate your corporate gifting with artisanal, slow-roasted Bihar wetland Makhana. Custom co-branded festive hampers, employee wellness kits, and volume wholesale pricing.",
  alternates: {
    canonical: "/corporate-gifting",
  },
  openGraph: {
    title: "Corporate Gifting & Bulk Orders | Makhana Gold",
    description:
      "Bespoke superfood hampers & bulk wholesale Fox Nuts for festive gifting, employee wellness, and corporate events.",
    url: "https://makhanagold.com/corporate-gifting",
    images: [{ url: "/images/vibrant/hero.jpg", width: 1200, height: 630 }],
  },
};

export default async function CorporateGiftingPage() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings["support_whatsapp"] || "916001684216";
  const gstinNumber = settings["gstin_number"] || "10AAACM1234F1Z5";

  return (
    <main className="overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-[#140E06] text-[#F9F5ED] py-16 sm:py-24 px-5 sm:px-gutter border-b-2 border-amber-500/20">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/images/vibrant/hero.jpg"
            alt="Corporate Gifting Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute left-1/2 -top-20 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px] text-amber-400">card_giftcard</span>
            Corporate &amp; Enterprise Gifting
          </span>

          <h1 className="font-display-lg text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
            Artisanal Wellness Hampers.<br />
            <span className="italic font-normal text-amber-400">Tailored for Your Brand.</span>
          </h1>

          <p className="font-body-md text-xs sm:text-base text-amber-100/80 max-w-2xl mx-auto leading-relaxed">
            Move away from generic sweets. Gift your clients, partners, and employees the purity of 100% natural, slow-roasted Bihar wetland Fox Nuts in bespoke co-branded luxury packaging.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-amber-200">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-amber-400 text-base">receipt_long</span>
              100% GST Input Credit (GSTIN: {gstinNumber})
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-amber-400 text-base">pin_drop</span>
              Pan-India Multi-Desk Delivery
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-amber-400 text-base">brush</span>
              Custom Logo Sleeves
            </span>
          </div>
        </div>
      </section>

      {/* 2. Tiered Volume Pricing Grid */}
      <section className="py-12 sm:py-16 bg-[#FAF6EE] px-5 sm:px-gutter border-b border-amber-900/10">
        <div className="max-w-container-max mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-1">
              Transparent Volume Pricing
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
              Tiered Bulk Discounts
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Direct farm-to-table pricing with zero middlemen markups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Silver Tier */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient flex flex-col justify-between">
              <div>
                <span className="inline-block bg-neutral-100 text-neutral-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  Silver Tier
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1">
                  25 – 50 Units
                </h3>
                <p className="text-2xl font-black text-[#D84315] mb-4">
                  10% OFF <span className="text-xs font-normal text-neutral-500">Retail MRP</span>
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-600 border-t border-amber-900/10 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>Standard Gold Presentation Box</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>Custom Message Insert Card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>Free Single-Point Bulk Delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Gold Tier (Featured) */}
            <div className="bg-[#1C150C] text-[#F9F5ED] p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-warm-2 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-[#D84315] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-xs">
                ⭐ Most Popular
              </div>
              <div>
                <span className="inline-block bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  Gold Privilege Tier
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-white mb-1">
                  50 – 200 Units
                </h3>
                <p className="text-2xl font-black text-amber-400 mb-4">
                  15% OFF <span className="text-xs font-normal text-amber-200/60">Retail MRP</span>
                </p>
                <ul className="space-y-2.5 text-xs text-amber-100/80 border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm">check_circle</span>
                    <span>Custom Co-Branded Outer Sleeve</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm">check_circle</span>
                    <span>Choose Any 3 Flavours Mix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm">check_circle</span>
                    <span>Complimentary Taste Sample Box</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm">check_circle</span>
                    <span>Priority Dispatch in 3 Business Days</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Platinum Tier */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient flex flex-col justify-between">
              <div>
                <span className="inline-block bg-neutral-100 text-neutral-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  Enterprise Wholesale
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1">
                  200+ Units
                </h3>
                <p className="text-2xl font-black text-[#D84315] mb-4">
                  25% OFF <span className="text-xs font-normal text-neutral-500">Direct Sourcing</span>
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-600 border-t border-amber-900/10 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>100% Bespoke Gift Box Design</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>Pan-India Multi-Desk Employee Shipping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <span>Dedicated Key Account Manager</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive RFQ Form Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-gutter max-w-container-max mx-auto">
        <CorporateGiftingFormClient whatsappNumber={whatsappNumber} />
      </section>

      {/* 4. Why Choose Makhana Gold for Corporate Gifting */}
      <section className="py-12 sm:py-16 bg-white border-t border-amber-900/10 px-5 sm:px-gutter">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-center text-on-surface mb-8">
            Why Forward-Thinking Companies Choose Us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#D84315] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-950 mb-1">Guaranteed Healthy &amp; Clean</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Zero refined sugars, zero palm oil, 100% vegan, and gluten-free. Loved by fitness enthusiasts and conscious eaters alike.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#D84315] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-950 mb-1">9-Month Nitrogen Crisp Seal</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Packaged in moisture-barrier gold foil pouches ensuring lasting crunchiness for long festive seasons and multi-city shipments.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#D84315] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">receipt</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-950 mb-1">GST Compliant Invoicing</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Clear HSN 19041090 corporate tax invoices with your company’s GSTIN for seamless input tax credit reconciliation.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#D84315] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">support_agent</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-950 mb-1">Direct Priority WhatsApp Desk</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Direct concierge coordination at +91 60016 84216 for expedited sample dispatch and customized packaging proofs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
