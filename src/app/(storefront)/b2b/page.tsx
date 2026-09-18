import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BulkOrderSheetClient } from "./BulkOrderSheetClient";

export const metadata: Metadata = {
  title: "B2B Wholesale Superfoods | Volume Slabs up to 35% OFF | Makhana Gold",
  description:
    "Procure artisanal Makhana, Sattu & Poha at wholesale volume discounts up to 35% OFF. Full GST Input Tax Credit (HSN 19041090). Pan-India express pallet dispatch.",
  alternates: { canonical: "/b2b" },
  openGraph: {
    title: "Makhana Gold B2B Wholesale Portal",
    description: "Direct-from-source wholesale for organic stores, cafes, corporate pantries & distributors.",
    url: "https://makhanagold.com/b2b",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
  },
};

export default async function B2BWholesalePage() {
  const rawProducts = await prisma.product.findMany({
    where: { status: "active" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { price: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
    variants: p.variants.map((v) => ({
      id: v.id,
      packSize: v.packSize,
      price: v.price.toString(),
      compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : null,
      weightGrams: v.weightGrams,
    })),
  }));

  return (
    <div className="min-h-screen bg-[#F9F6F1]">

      {/* ── HERO (slim) ───────────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-amber-950 to-[#1C150C] text-white px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-amber-200/60 font-medium mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-amber-400 font-bold">B2B Wholesale</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Left: headline */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="material-symbols-outlined text-[13px]">store</span>
                Official Wholesale & Institutional Supply
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-4xl font-black text-white mb-2 max-w-2xl leading-tight">
                Bulk Procurement Portal —{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-[#FF8A65]">
                  Up to 35% OFF
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/75 max-w-xl">
                Mix any flavors. Volume discounts apply automatically across your entire order.
                GST Tax Invoice with full ITC (HSN 19041090) generated instantly.
              </p>
            </div>

            {/* Right: 4 stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
              {[
                { val: "35%", label: "Max Discount" },
                { val: "GST ITC", label: "100% Claimable" },
                { val: "28 States", label: "Express Freight" },
                { val: "48h SLA", label: "Dispatch" },
              ].map((s) => (
                <div key={s.val} className="p-3 rounded-2xl bg-white/8 border border-white/10 text-center">
                  <div className="text-base sm:text-lg font-black text-amber-400">{s.val}</div>
                  <div className="text-[10px] text-amber-200/70 font-bold uppercase tracking-wide mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
        <BulkOrderSheetClient products={products} supportWhatsapp="916001684216" />

        {/* ── Trust Pillars (3 cards, compact) ───────────────────────────── */}
        <section className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "receipt_long",    bg: "bg-emerald-50",  ic: "text-emerald-700",  title: "GST Tax Invoices",        body: "Auto-generated with your GSTIN, Company Name & HSN 19041090 for 100% ITC claim." },
            { icon: "verified",        bg: "bg-amber-50",    ic: "text-amber-700",    title: "FSSAI Certified",         body: "Nitrogen-flushed 4-layer barrier pouches. 9-month shelf life. Zero artificial additives." },
            { icon: "local_shipping",  bg: "bg-orange-50",   ic: "text-[#D84315]",   title: "Express Pallet Freight",  body: "5-ply corrugated cartons via Delhivery / BlueDart. Real-time AWB tracking." },
          ].map((c) => (
            <div key={c.title} className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-2xs flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.ic} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950 mb-0.5">{c.title}</h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── FAQ (4 items, accordion-free, compact) ─────────────────────── */}
        <section className="mt-10 mb-8 p-5 sm:p-7 rounded-2xl bg-white border border-neutral-100 shadow-2xs">
          <h2 className="text-base font-black text-amber-950 mb-4">Wholesale Buyer FAQs</h2>
          <div className="space-y-3">
            {[
              {
                q: "Can I mix flavors to hit the wholesale threshold?",
                a: "Yes! Discounts apply to the total cumulative pack count across all SKUs. 25 Pink Salt + 25 Peri Peri = 50 packs → Retailer tier (25% OFF).",
              },
              {
                q: "How do I get a GST Tax Invoice for ITC?",
                a: "Enter your GSTIN in the GSTIN field (click 'GSTIN' in the bottom bar). Your Tax Invoice is auto-generated and emailed instantly after checkout.",
              },
              {
                q: "What payment methods are accepted for bulk orders?",
                a: "Razorpay (Credit Card, Net Banking, UPI), COD up to ₹50,000, and NEFT/RTGS against a Proforma Invoice.",
              },
              {
                q: "Can bulk orders be returned?",
                a: "No returns per FSSAI consumable food standards. Transit damage? WhatsApp us at +91 60016 84216 with a photo for a free batch replacement within 48h.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-4 rounded-xl border border-neutral-100 hover:border-amber-200 transition-colors">
                <p className="text-xs font-black text-amber-950 mb-1">{faq.q}</p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Enterprise Callout ──────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Enterprise Supply
            </span>
            <h3 className="font-headline-sm text-base sm:text-lg font-black mt-2 mb-1">
              Private Label or 500 kg+ Container Procurement?
            </h3>
            <p className="text-xs text-amber-200/75 max-w-lg">
              Custom flavor formulations, co-branded packaging, and bulk grain bags direct from our Madhubani, Bihar harvest facility.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link href="/corporate-gifting" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wide transition-colors border border-white/20">
              Gift Boxes
            </Link>
            <a
              href="https://wa.me/916001684216?text=Namaste%2C%20enterprise%20bulk%20procurement%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              Talk to Us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
