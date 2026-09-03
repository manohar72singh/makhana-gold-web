import type { Metadata } from "next";
import { FaqAccordion } from "@/components/storefront/FaqAccordion";
import { SupportFormClient } from "./SupportFormClient";
import { getSiteSettings, getFaqCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Customer Support, Concierge & FAQs",
  description:
    "Get in touch with the Makhana Gold team for order tracking, bespoke corporate gift hampers, or browse our comprehensive FAQs regarding sourcing, roasting, and shipping.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Customer Support & FAQs | Makhana Gold",
    description:
      "Concierge assistance for order queries, corporate gifting, and artisanal product details.",
    url: "https://makhanagold.com/support",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
  },
};

export default async function SupportPage() {
  const [settings, faqCategories] = await Promise.all([
    getSiteSettings(),
    getFaqCategories(),
  ]);

  const supportEmail = settings["support_email"] || "mmakhanaltd@gmail.com";
  const supportPhone = settings["support_phone"] || "+91 60016 84216";
  const supportHours = settings["support_hours"] || "Mon — Sat from 9:30 AM to 6:30 PM IST";
  const studioAddress =
    settings["studio_address"] ||
    "Mithilanchal Makhana Audyogikaran Pvt. Ltd.\nConnaught Place, New Delhi, 110001, India";

  // Generate dynamic FAQPage JSON-LD Structured Data
  const allFaqItems = faqCategories.flatMap((cat) => cat.items);
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-8 sm:py-12 md:py-16">
      {/* Dynamic Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Hero Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-2">
          Help &amp; Customer Care
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-xl text-on-surface mb-3">
          How Can We Help You?
        </h1>
        <p className="font-body-md text-sm md:text-base text-on-surface-variant leading-relaxed">
          From order queries to customized corporate gift sets, our concierge team is here to assist you.
        </p>
      </div>

      {/* 2-Column Support Grid: Contact Form & Direct Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Left Column: Direct Contact Cards (DB-driven) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
            <h2 className="font-headline-sm text-lg font-bold text-primary mb-6">
              Direct Channels
            </h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                    Email Concierge
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant font-mono">
                    {supportEmail}
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    Response within 12-24 business hours.
                  </p>
                </div>
              </div>

              {/* WhatsApp / Phone */}
              <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/20">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <div>
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                    WhatsApp Support
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant font-mono">
                    {supportPhone}
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    {supportHours}
                  </p>
                </div>
              </div>

              {/* Headquarters */}
              <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/20">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                    Experience Studio
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {studioAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form (writes to DB) */}
        <div className="lg:col-span-7">
          <SupportFormClient />
        </div>
      </div>

      {/* FAQs Section (100% DB-driven) */}
      <section className="max-w-3xl mx-auto pt-8 border-t border-outline-variant/30">
        <div className="text-center mb-8">
          <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-1">
            Common Questions
          </span>
          <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
            Frequently Asked Questions
          </h2>
        </div>

        <FaqAccordion categories={faqCategories} />
      </section>
    </main>
  );
}
