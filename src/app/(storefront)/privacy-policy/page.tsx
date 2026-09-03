import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy | Makhana Gold",
  description: "Learn how Makhana Gold protects your privacy, personal information, and data security.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const storeName = settings["store_name"] || "Mithilanchal Makhana Audyogikaran Pvt. Ltd.";
  const supportEmail = settings["support_email"] || "mmakhanaltd@gmail.com";
  const supportPhone = settings["support_phone"] || "+91 60016 84216";
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
            <span className="text-primary font-semibold">Privacy Policy</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="border-b border-amber-900/10 pb-6 mb-8">
        <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-2">
          Legal & Data Protection
        </span>
        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Last updated: January 2026 • In compliance with the Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">security</span>
            1. Commitment to Your Privacy
          </h2>
          <p className="text-on-surface-variant">
            At <strong>{storeName}</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we are committed to safeguarding the privacy of our visitors, customers, and club members. This Privacy Policy details how we collect, process, utilize, and protect your personal information when you visit our website, place orders, or engage with our services.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">database</span>
            2. Information We Collect
          </h2>
          <p className="text-on-surface-variant">We collect personal information necessary to fulfill orders and provide an artisanal snacking experience:</p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base">
            <li><strong>Identity & Contact Details:</strong> Name, delivery address, billing address, phone number, and email address.</li>
            <li><strong>Transaction & Payment Details:</strong> Order histories, chosen payment method, invoice logs. <em>Note: Sensitive card details or UPI PINs are processed securely by RBI-licensed payment gateways (Razorpay) and are never stored on our servers.</em></li>
            <li><strong>Technical & Browsing Data:</strong> IP address, device type, browser identifiers, cookies, and page interaction timestamps to enhance website performance.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">checklist</span>
            3. How We Use Your Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <h3 className="font-bold text-sm text-amber-950 mb-1">Order Fulfillment</h3>
              <p className="text-xs text-amber-900/80">Processing orders, dispatching via logistics partners (Delhivery/BlueDart), and generating GST Tax invoices.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <h3 className="font-bold text-sm text-amber-950 mb-1">Customer Care & Tracking</h3>
              <p className="text-xs text-amber-900/80">Sending real-time order dispatch notifications, delivery tracking links, and addressing inquiries via email or WhatsApp.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <h3 className="font-bold text-sm text-amber-950 mb-1">Personalized Offers</h3>
              <p className="text-xs text-amber-900/80">Delivering seasonal harvest promotions and Gold Privilege Club discounts (with instant 1-click unsubscribe).</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <h3 className="font-bold text-sm text-amber-950 mb-1">Fraud Prevention & Security</h3>
              <p className="text-xs text-amber-900/80">Detecting unauthorized transactions and maintaining 256-bit SSL encrypted shopping integrity.</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">lock</span>
            4. 100% Zero Spam & Third-Party Sharing Policy
          </h2>
          <p className="text-on-surface-variant">
            We <strong>never sell, rent, or trade your personal data</strong> to external third-party advertisers. Information is strictly shared only with verified operational partners essential for your purchase:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant text-sm">
            <li>RBI-certified payment processors (Razorpay) for secure payment tokenization.</li>
            <li>Pan-India courier networks (Delhivery, Shiprocket, BlueDart) for timely doorstep dispatch.</li>
            <li>Government regulatory or law enforcement authorities only when mandated by applicable Indian law.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">contact_support</span>
            5. Grievance Officer & Contact Details
          </h2>
          <p className="text-on-surface-variant">
            In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, our designated Grievance Officer details are provided below:
          </p>
          <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-amber-900/15 text-xs sm:text-sm space-y-1 font-mono text-amber-950">
            <p><strong>Grievance Officer:</strong> Customer Redressal Cell, {storeName}</p>
            <p><strong>Registered Address:</strong> {address}</p>
            <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-[#D84315] underline">{supportEmail}</a></p>
            <p><strong>Contact Desk:</strong> {supportPhone} (Mon - Sat, 10:00 AM to 6:00 PM IST)</p>
          </div>
        </section>
      </div>
    </main>
  );
}
