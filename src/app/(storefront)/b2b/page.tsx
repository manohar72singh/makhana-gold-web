import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings, isCategorySlugComingSoon } from "@/lib/content";
import { BulkOrderSheetClient } from "./BulkOrderSheetClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "B2B Raw Makhana Wholesale Portal | 10 kg MOQ | Makhana Gold",
  description:
    "Direct-from-source Raw Handpicked Makhana wholesale in 4 certified grades (7 Suta, 6 Suta, 5 Suta, 4 Suta). Minimum order quantity 10 kg. Full GST ITC (HSN 19041090).",
  alternates: { canonical: "/b2b" },
  openGraph: {
    title: "Makhana Gold B2B Raw Makhana Wholesale Portal",
    description: "Wholesale direct from Madhubani harvest facility. 10 kg MOQ. 7+, 6+, 5+, 4 Suta certified grades.",
    url: "https://makhanagold.com/b2b",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
  },
};

async function getRawProducts() {
  try {
    return await prisma.product.findMany({
      where: {
        status: "active",
        id: { not: 21 }, // Exclude test payment product
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { price: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[b2b] Failed to fetch live products, rendering fallback:", err);
    return [];
  }
}

export default async function B2BWholesalePage() {
  const [rawProducts, settings] = await Promise.all([
    getRawProducts(),
    getSiteSettings().catch(() => ({})),
  ]);

  const rawMakhanaSlugs = new Set([
    "7-plus-suta-handpicked-makhana",
    "6-plus-suta-handpicked-makhana",
    "premium-handpicked-makhana",
    "4-suta-handpicked-makhana",
  ]);

  const products = rawProducts.map((p) => {
    const catComingSoon = isCategorySlugComingSoon(p.category?.slug, settings);
    const isRawMakhana = rawMakhanaSlugs.has(p.slug);
    const isComingSoon = catComingSoon || !isRawMakhana;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
      isComingSoon,
      variants: p.variants.map((v) => ({
        id: v.id,
        packSize: v.packSize,
        price: v.price.toString(),
        compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : null,
        weightGrams: v.weightGrams ?? 250,
      })),
    };
  });

  return (
    <div className="min-h-screen bg-[#F9F6F1]">

      {/* ── HERO (slim) ───────────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-amber-950 via-[#1C150C] to-amber-950 text-white px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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
                Official Wholesale Portal • Minimum Order 10 kg
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-4xl font-black text-white mb-2 max-w-2xl leading-tight">
                Direct Raw Makhana Wholesale —{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-[#FF8A65]">
                  10 kg MOQ
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl leading-relaxed">
                Source 100% authentic Bihar wetland Raw Handpicked Makhana in 4 certified grades: <strong>7+ Suta (Super Jumbo), 6+ Suta (Jumbo), 5+ Suta (Premium), and 4 Suta (Standard)</strong>.
                Only Raw Makhana available right now; other categories coming soon. Instant GST Tax Invoice with full ITC (HSN 19041090).
              </p>
            </div>

            {/* Right: 4 stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
              {[
                { val: "10 kg", label: "Wholesale MOQ" },
                { val: "4 Suta Grades", label: "Certified Raw" },
                { val: "Up to 35%", label: "Volume Slabs" },
                { val: "100% ITC", label: "GST Tax Invoice" },
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
            { icon: "verified",        bg: "bg-amber-50",    ic: "text-amber-700",    title: "100% Handpicked Raw Makhana", body: "Directly sorted by size in Suta (4, 5, 6, 7). Zero adulteration, clean harvest quality." },
            { icon: "local_shipping",  bg: "bg-orange-50",   ic: "text-[#D84315]",   title: "Pan-India Freight (10kg+)", body: "Corrugated master cartons dispatched via Delhivery, BlueDart, or surface cargo with live tracking." },
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
          <h2 className="text-base font-black text-amber-950 mb-4">Raw Makhana Wholesale Buyer FAQs</h2>
          <div className="space-y-3">
            {[
              {
                q: "What is the Minimum Order Quantity (MOQ) for wholesale?",
                a: "Wholesale pricing begins at a minimum of 10 kg (40 packs of 250g). You can mix any of the 4 Raw Makhana grades (4 Suta, 5 Suta, 6 Suta, 7 Suta) to fulfill your 10 kg threshold.",
              },
              {
                q: "Which qualities of Makhana are available right now?",
                a: "We currently provide 4 authentic Handpicked Raw Makhana qualities: 4 Suta (Standard), 5+ Suta (Premium), 6+ Suta (Jumbo), and 7+ Suta (Super Jumbo). Flavoured varieties and other processed superfoods are Coming Soon.",
              },
              {
                q: "How do corporate orders and private branding work?",
                a: "Corporate orders start from just 500g! We provide custom company labeling, corporate gift boxes, and bespoke packaging. Visit our Corporate Gifting portal or chat on WhatsApp.",
              },
              {
                q: "How do I claim GST Input Tax Credit (ITC)?",
                a: "Simply enter your 15-digit GSTIN during checkout or in the bulk dock. Your GST Tax Invoice (HSN 19041090) is automatically generated and emailed immediately.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-4 rounded-xl border border-neutral-100 hover:border-amber-200 transition-colors">
                <p className="text-xs font-black text-amber-950 mb-1">{faq.q}</p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Enterprise & Corporate Callout ──────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Corporate &amp; Private Labeling
            </span>
            <h3 className="font-headline-sm text-base sm:text-lg font-black mt-2 mb-1">
              Need Corporate Orders (from 500g) with Custom Company Labeling?
            </h3>
            <p className="text-xs text-amber-200/75 max-w-lg">
              We offer bespoke company branding, custom gift boxes, and private labeling starting from just 500g upwards.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link href="/corporate-gifting" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wide transition-colors border border-white/20">
              Corporate Gifting (500g+)
            </Link>
            <a
              href="https://wa.me/916001684216?text=Namaste%2C%20wholesale%2010kg%20raw%20makhana%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              WhatsApp Desk
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
