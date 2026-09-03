import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";
import { getSiteSettings, getMarketplaceLinks } from "@/lib/content";

export async function SiteFooter() {
  const [settings, marketplaceLinks] = await Promise.all([
    getSiteSettings(),
    getMarketplaceLinks(),
  ]);

  const storeDescription =
    settings["store_description"] ||
    "Artisanal Heritage • Modern Wellness. Sourced responsibly from generational wetland farms in Bihar, slow-roasted to golden crispness.";
  const supportEmail = settings["support_email"] || "mmakhanaltd@gmail.com";
  const supportPhone = settings["support_phone"] || "+91 60016 84216";
  const supportWhatsapp = settings["support_whatsapp"] || "916001684216";
  const instagramUrl = settings["social_instagram"] || "https://instagram.com";
  const newsletterTitle = settings["newsletter_title"] || "The Gold Privilege Club";
  const newsletterDesc =
    settings["newsletter_description"] ||
    "Join for 15% off your first order, private festive pre-sales, and curated culinary recipes.";
  const fssaiNumber = settings["fssai_license"] || "10021022000123";
  const gstinNumber = settings["gstin_number"] || "10AAACM1234F1Z5";
  const storeName = settings["store_name"] || "Mithilanchal Makhana Audyogikaran Pvt. Ltd.";

  return (
    <footer className="bg-[#140E06] text-[#F9F5ED] w-full pt-12 sm:pt-16 pb-10 sm:pb-12 mt-huge border-t-2 border-amber-500/30 relative overflow-hidden">
      {/* Subtle Golden Ambient Glow */}
      <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-container-max mx-auto px-5 sm:px-gutter">
        {/* Main Grid: Brand + Shop + Care + Newsletter */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-14 border-b border-white/10 relative z-10">
          {/* Brand Column — full width on mobile */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4 flex flex-col items-start">
            <Link
              href="/"
              className="inline-block hover:scale-102 transition-transform duration-300 mb-4 sm:mb-5"
            >
              <div className="relative w-40 h-14 sm:w-52 sm:h-20">
                <Image
                  src="/images/logo/logo.png"
                  alt="Makhana Gold — Premium Artisanal Roasted Fox Nuts from Bihar"
                  title="Makhana Gold"
                  fill
                  sizes="208px"
                  className="object-contain drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)]"
                />
              </div>
            </Link>

            <p className="font-body-md text-xs sm:text-sm text-amber-100/75 mb-5 leading-relaxed max-w-sm">
              {storeDescription}
            </p>

            {/* Quality & Trust Pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-amber-300">
                <span className="material-symbols-outlined text-[14px] text-amber-400">eco</span>
                100% Wetland Harvest
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-amber-300">
                <span className="material-symbols-outlined text-[14px] text-amber-400">verified</span>
                Zero Palm Oil
              </span>
            </div>

            {/* Social Icons (Dynamic Admin Configured) */}
            <div className="flex items-center space-x-3 text-amber-100/80">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </a>
              )}
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  aria-label="Email Concierge"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </a>
              )}
              {supportWhatsapp && (
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Support"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </a>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-span-1 lg:col-span-3 flex flex-col space-y-3">
            <h4 className="font-label-md text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              Shop Collection
            </h4>
            <Link
              href="/shop"
              className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors"
            >
              All Roasted Flavours
            </Link>
            <Link
              href="/shop?category=roasted-makhana"
              className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Himalayan Pink Salt</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                Best Seller
              </span>
            </Link>
            <Link
              href="/shop?category=flavoured-makhana"
              className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors"
            >
              Fiery Peri Peri Zest
            </Link>
            <Link
              href="/product/truffle-parmesan-makhana"
              className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Black Truffle &amp; Herb</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                New
              </span>
            </Link>
            <Link
              href="/offers"
              className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors"
            >
              Festive Gift Hampers
            </Link>
          </div>

          {/* Customer Care Column */}
          <div className="col-span-1 lg:col-span-2 flex flex-col space-y-3">
            <h4 className="font-label-md text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              Customer Care
            </h4>
            <Link href="/support" title="Makhana Gold Help & FAQ Center" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors">
              Help &amp; FAQ Center
            </Link>
            <Link href="/track" title="Track your Makhana Gold order" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors">
              Track Your Order
            </Link>
            <Link href="/shipping-policy" title="Makhana Gold Shipping & Delivery Policy" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors">
              Shipping &amp; Delivery
            </Link>
            <Link href="/refund-policy" title="Makhana Gold Returns & Refunds Policy" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors">
              Returns &amp; Refunds
            </Link>
            <Link href="/certifications" title="View Makhana Gold FSSAI certifications and lab reports" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-amber-400">verified</span>
              Certifications &amp; Quality
            </Link>
            <Link href="/corporate-gifting" title="Corporate and bulk gifting solutions from Makhana Gold" className="text-xs sm:text-sm text-amber-100/70 hover:text-amber-300 transition-colors">
              Corporate &amp; Bulk Gifting
            </Link>
          </div>

          {/* Newsletter Column — full-width on mobile */}
          <div className="col-span-2 lg:col-span-3 flex flex-col space-y-3">
            <h4 className="font-label-md text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              {newsletterTitle}
            </h4>
            <p className="font-body-sm text-xs text-amber-100/75 leading-relaxed">
              {newsletterDesc}
            </p>
            <NewsletterForm />
            <p className="text-[11px] text-amber-100/50 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[13px] text-amber-400">lock</span>
              Zero spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Marketplace Channels Trust Ribbon (100% DB-driven) */}
        {marketplaceLinks.length > 0 && (
          <div className="py-5 sm:py-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100/70">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-base">storefront</span>
              <span className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
                Official Retail Channels:
              </span>
              <span className="hidden sm:inline">Delivered Fresh Across India</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {marketplaceLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 sm:px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] sm:text-[11px] hover:border-amber-400/60 transition-all inline-flex items-center gap-1.5"
                >
                  <span>{link.name}</span>
                  {link.badgeText && (
                    <span className="text-[9px] text-amber-300 font-normal opacity-80">
                      • {link.badgeText}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Strip: Legal, Compliance & Certifications */}
        <div className="pt-6 sm:pt-8 flex flex-col lg:flex-row justify-between items-center text-xs text-amber-100/60 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left flex-wrap">
            <span>
              © {new Date().getFullYear()} {storeName}. All Rights Reserved.
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <Link href="/privacy-policy" className="hover:text-amber-300 transition-colors underline">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-white/20">•</span>
            <Link href="/terms-of-service" className="hover:text-amber-300 transition-colors underline">
              Terms &amp; Conditions
            </Link>
            {fssaiNumber && (
              <>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono text-[11px] font-bold border border-white/15">
                  <span className="text-[10px] text-amber-400 font-sans font-black tracking-wider uppercase">fssai</span>
                  <span>Lic. #{fssaiNumber}</span>
                </span>
              </>
            )}
            {gstinNumber && (
              <>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="text-[11px] text-amber-100/70">GSTIN: {gstinNumber}</span>
              </>
            )}
          </div>

          {/* Certification badges */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1 text-[11px] text-amber-200/80">
              <span className="material-symbols-outlined text-sm text-amber-400">verified</span>
              100% Genuine Quality
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-200/80">
              <span className="material-symbols-outlined text-sm text-amber-400">lock</span>
              256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-200/80">
              <span className="material-symbols-outlined text-sm text-amber-400">local_shipping</span>
              Pan-India Express
            </span>
          </div>
        </div>

        {/* Quantyro Technologies Credit & Designer Badge */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-amber-100/50 text-[11px] text-center sm:text-left flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-amber-400/70">auto_awesome</span>
            <span>Crafted for artisanal excellence &amp; certified natural purity.</span>
          </div>

          <a
            href="https://quantyrotechnologies.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group p-[1.5px] rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 hover:from-amber-400 hover:via-cyan-300 hover:to-emerald-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.45)] hover:scale-103 transition-all duration-300 inline-block shrink-0"
          >
            <div className="px-4 py-1.5 rounded-full bg-[#160E08]/95 backdrop-blur-md flex items-center gap-2.5 transition-all">
              {/* Radar Status Pulse */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
              </span>

              {/* Text Label */}
              <span className="text-[11.5px] text-amber-100/80 group-hover:text-white transition-colors font-medium">
                Designed &amp; Developed by
              </span>

              {/* Glowing Quantyro Technologies Brand Name */}
              <span className="text-[12.5px] font-black tracking-wide bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent group-hover:from-emerald-200 group-hover:via-white group-hover:to-cyan-200 transition-all drop-shadow-[0_1px_8px_rgba(251,191,36,0.3)]">
                Quantyro Technologies
              </span>

              {/* Animated External Arrow */}
              <span className="material-symbols-outlined text-[14px] text-amber-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                open_in_new
              </span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
