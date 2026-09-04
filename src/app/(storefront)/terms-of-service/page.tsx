import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms & Conditions | Makhana Gold",
  description: "Terms of service, sales terms, and user agreements for Makhana Gold.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default async function TermsOfServicePage() {
  const settings = await getSiteSettings();
  const storeName = settings["store_name"] || "Mithilanchal Makhana Udyogikaran Pvt. Ltd.";
  const supportEmail = settings["support_email"] || "mmakhanaltd@gmail.com";
  const address = settings["studio_address"] || "Connaught Place, New Delhi - 110001, India";

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
            <span className="text-primary font-semibold">Terms of Service</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="border-b border-amber-900/10 pb-6 mb-8">
        <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-2">
          Legal Agreement
        </span>
        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface mb-3">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Effective Date: January 2026 • Please read these terms carefully before placing an order.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">gavel</span>
            1. Agreement to Terms
          </h2>
          <p className="text-on-surface-variant">
            By accessing or ordering from the <strong>{storeName}</strong> website, you agree to be bound by these Terms and Conditions, all applicable laws and regulations of India, and agree that you are responsible for compliance with any local laws. If you do not agree with any of these terms, you are prohibited from using this site.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">shopping_bag</span>
            2. Orders, Pricing &amp; Payments
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base">
            <li><strong>Pricing:</strong> All prices listed are in Indian Rupees (INR) and inclusive of all applicable Goods and Services Tax (GST).</li>
            <li><strong>Accuracy:</strong> While we make every effort to display accurate product weights, pack sizes, and images, small batch harvest variations may naturally occur.</li>
            <li><strong>Order Confirmation:</strong> An order confirmation email and SMS constitute acknowledgment of your purchase order, subject to payment verification and product availability.</li>
            <li><strong>Payment Modes:</strong> We accept online payments through Razorpay (UPI, Credit/Debit Cards, Netbanking) and Cash on Delivery (COD) across serviceable pin codes.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">local_shipping</span>
            3. Shipping, Delivery &amp; Title
          </h2>
          <p className="text-on-surface-variant">
            Orders are dispatched within 24-48 business hours from our certified fulfillment hubs. Title and risk of loss for products pass to you upon delivery by the courier partner. Please inspect packages upon receipt and report any outer damage immediately.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">verified</span>
            4. Food Quality, Safety &amp; FSSAI
          </h2>
          <p className="text-on-surface-variant">
            Our products are 100% natural, vegetarian, gluten-free, and manufactured in facilities adhering strictly to Food Safety and Standards Authority of India (FSSAI) guidelines. Best before dates and batch QR codes are printed on every individual pack.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">copyright</span>
            5. Intellectual Property &amp; Governing Law
          </h2>
          <p className="text-on-surface-variant">
            All brand trademarks, imagery, recipes, logos, and digital assets on this platform belong exclusively to {storeName}. Any unauthorized reproduction is strictly prohibited. These Terms shall be governed by and construed in accordance with the laws of India, and disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
          </p>
          <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 text-xs text-amber-900/80">
            For questions regarding these Terms, contact our legal desk at: <a href={`mailto:${supportEmail}`} className="text-[#D84315] font-bold underline">{supportEmail}</a> or address mail to: {address}.
          </div>
        </section>
      </div>
    </main>
  );
}
