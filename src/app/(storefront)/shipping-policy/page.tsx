import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Makhana Gold",
  description: "Learn about Pan-India shipping timelines, delivery rates, and courier tracking at Makhana Gold.",
  alternates: {
    canonical: "/shipping-policy",
  },
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const storeName = settings["store_name"] || "Mithilanchal Makhana Audyogikaran Pvt. Ltd.";
  const supportEmail = settings["support_email"] || "mmakhanaltd@gmail.com";
  const supportPhone = settings["support_phone"] || "+91 60016 84216";

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-gutter py-8 sm:py-12 md:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-6 sm:mb-8">
        <ol className="inline-flex items-center space-x-1.5 whitespace-nowrap">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <span className="material-symbols-outlined text-xs mx-1">chevron_right</span>
            <span className="text-primary font-semibold">Shipping Policy</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="border-b border-amber-900/10 pb-6 mb-8">
        <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-2">
          Pan-India Logistics
        </span>
        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface mb-3">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Fresh wetland harvests dispatched directly from our regional fulfillment hubs across India.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 text-center shadow-ambient">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D84315] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface mb-1">Free Shipping</h3>
            <p className="text-xs text-on-surface-variant">On all orders above ₹500 across India. (Standard ₹60 below ₹500)</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 text-center shadow-ambient">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D84315] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface mb-1">24-Hour Dispatch</h3>
            <p className="text-xs text-on-surface-variant">Orders processed &amp; packed fresh within 1 business day.</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 text-center shadow-ambient">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D84315] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">pin_drop</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface mb-1">Live Tracking</h3>
            <p className="text-xs text-on-surface-variant">Instant AWB tracking link via Email, SMS &amp; Customer Portal.</p>
          </div>
        </div>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">timer</span>
            1. Estimated Delivery Timelines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm divide-y divide-amber-900/10">
              <thead>
                <tr className="text-amber-900 font-bold uppercase tracking-wider text-[11px] bg-[#FAF6EE]">
                  <th className="py-3 px-4 rounded-l-xl">Destination Zone</th>
                  <th className="py-3 px-4">Courier Partner</th>
                  <th className="py-3 px-4 rounded-r-xl">Estimated Transit Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10 text-on-surface-variant">
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">Delhi NCR, Mumbai, Bengaluru</td>
                  <td className="py-3 px-4">Delhivery Express / BlueDart Air</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">2 - 3 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">Tier 1 &amp; Tier 2 Metro Cities</td>
                  <td className="py-3 px-4">Delhivery Surface / Xpressbees</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">3 - 4 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">Rest of India &amp; Rural Pin Codes</td>
                  <td className="py-3 px-4">India Post Speed Post / Delhivery</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">4 - 6 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">payments</span>
            2. Cash on Delivery (COD) Guidelines
          </h2>
          <p className="text-on-surface-variant">
            Cash on Delivery is available across 19,000+ Indian postal codes. Please note:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant text-sm">
            <li>Our delivery executive will collect cash or accept direct UPI QR payment at your doorstep upon handover.</li>
            <li>We recommend keeping exact change or your UPI app handy for contactless handover.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">inventory_2</span>
            3. Damaged or Tampered Parcels
          </h2>
          <p className="text-on-surface-variant">
            All our fox nuts are packed in 5-layer moisture-barrier nitrogen-flushed pouches to guarantee 100% freshness. If the outer courier box arrives visibly crushed, torn, or tampered with, please <strong>refuse delivery</strong> or take a quick photo and contact us immediately at <a href={`mailto:${supportEmail}`} className="text-[#D84315] font-bold underline">{supportEmail}</a> or WhatsApp <span className="font-bold text-on-surface">{supportPhone}</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
