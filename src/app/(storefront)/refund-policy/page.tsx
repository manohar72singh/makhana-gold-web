import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Return, Refund & Cancellation Policy | Makhana Gold",
  description: "Read our 7-day freshness guarantee and replacement policy for Makhana Gold products.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default async function RefundPolicyPage() {
  const settings = await getSiteSettings();
  const storeName = settings["store_name"] || "Makhana Gold India Pvt. Ltd.";
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
            <span className="text-primary font-semibold">Refund &amp; Return Policy</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="border-b border-amber-900/10 pb-6 mb-8">
        <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-2">
          Customer Satisfaction
        </span>
        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface mb-3">
          Return &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          100% Quality &amp; Crispness Guarantee • Sourced responsibly from Mithila wetlands.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">verified_user</span>
            1. 7-Day Replacement Guarantee
          </h2>
          <p className="text-on-surface-variant">
            Due to the consumable nature of gourmet superfoods, we do not accept returns on opened packets once accepted in good condition. However, we offer an unconditional <strong>7-Day Free Replacement or 100% Refund</strong> in any of the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base">
            <li>Item arrived in a damaged, torn, or unsealed state.</li>
            <li>Incorrect flavour or wrong pack size delivered compared to your order invoice.</li>
            <li>Product past its printed &ldquo;Best Before&rdquo; expiry date upon delivery.</li>
            <li>Significant defect in crispness or seal integrity.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">published_with_changes</span>
            2. How to Request a Replacement or Refund
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <span className="w-6 h-6 rounded-full bg-[#D84315] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-950">Report within 7 Days</p>
                <p className="text-xs text-amber-900/80">Go to your <Link href="/account/orders" className="text-[#D84315] font-bold underline">Order History</Link> or email us at <a href={`mailto:${supportEmail}`} className="text-[#D84315] underline">{supportEmail}</a> with your Order ID (#MG-XXXX).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <span className="w-6 h-6 rounded-full bg-[#D84315] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-950">Attach a Quick Photo</p>
                <p className="text-xs text-amber-900/80">Attach a clear photograph of the damaged outer box or defective pack label for verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] border border-amber-900/10">
              <span className="w-6 h-6 rounded-full bg-[#D84315] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-950">Immediate Resolution</p>
                <p className="text-xs text-amber-900/80">Our customer care desk will approve a priority re-dispatch at zero cost or process a full refund within 24 hours.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">account_balance</span>
            3. Refund Timelines &amp; Bank Credit
          </h2>
          <p className="text-on-surface-variant">
            Once a refund is approved by our support desk:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant text-sm">
            <li><strong>Prepaid Orders (UPI, Cards, Netbanking):</strong> Refund is initiated immediately via Razorpay back to your original source account (takes 3 to 5 business days depending on your bank).</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> Our team will request your UPI ID or NEFT Bank Details to transfer the refund directly within 24 business hours.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-ambient space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D84315]">cancel</span>
            4. Order Cancellation Policy
          </h2>
          <p className="text-on-surface-variant">
            You may cancel an order anytime before it has been handed over to the courier partner from your <Link href="/account/orders" className="text-[#D84315] font-bold underline">Customer Dashboard</Link> or by contacting our WhatsApp desk at <span className="font-bold text-on-surface">{supportPhone}</span>. If an online paid order is cancelled prior to shipment, a 100% full refund is issued instantly.
          </p>
        </section>
      </div>
    </main>
  );
}
