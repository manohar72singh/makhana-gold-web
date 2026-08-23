"use client";

import { useState, useTransition } from "react";
import { submitCorporateInquiryAction } from "./actions";

export function CorporateGiftingFormClient({
  whatsappNumber = "916001684216",
}: {
  whatsappNumber?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [quantity, setQuantity] = useState("50-200 Units (Gold Tier - 15% OFF)");
  const [occasion, setOccasion] = useState("Diwali & Festive Gifting");

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "") || "916001684216";
  const whatsappQuoteUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "Namaste Makhana Gold! I would like to request an instant corporate bulk quote for custom hampers / wholesale supply."
  )}`;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await submitCorporateInquiryAction(formData);
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.error || "Failed to submit inquiry.");
      }
    });
  }

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-warm-2 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-400">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <span className="material-symbols-outlined text-3xl">verified</span>
        </div>
        <h3 className="font-headline-md text-2xl font-bold text-amber-950 mb-2">
          Quotation Request Received!
        </h3>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Thank you for reaching out. Our dedicated Corporate Concierge team will prepare your customized volume pricing &amp; digital hamper mockups within <strong>2 to 4 business hours</strong>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappQuoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Chat Directly on WhatsApp</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-900/10 shadow-warm-2 max-w-3xl mx-auto">
      <div className="border-b border-amber-900/10 pb-5 mb-6 text-center sm:text-left">
        <span className="font-label-sm text-xs uppercase tracking-widest text-[#D84315] font-bold block mb-1">
          Instant Request for Quotation (RFQ)
        </span>
        <h3 className="font-headline-md text-2xl font-bold text-on-surface">
          Customize Your Bulk Corporate Order
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Receive tailored tiered pricing, packaging mockups, and pan-India doorstep sample boxes.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Your Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Company / Brand Name
            </label>
            <input
              type="text"
              name="companyName"
              placeholder="e.g. Google India / Reliance"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Work Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. corporate@company.com"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Phone / WhatsApp Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Estimated Quantity
            </label>
            <select
              name="quantityRange"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs cursor-pointer"
            >
              <option value="25-50 Units (Silver Tier - 10% OFF)">25 - 50 Units (Silver Tier • 10% OFF)</option>
              <option value="50-200 Units (Gold Tier - 15% OFF)">50 - 200 Units (Gold Tier • 15% OFF)</option>
              <option value="200-500 Units (Platinum Tier - 20% OFF)">200 - 500 Units (Platinum Tier • 20% OFF)</option>
              <option value="500+ Units (Enterprise Wholesale - 25% OFF)">500+ Units (Enterprise Wholesale • 25% OFF)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Occasion / Purpose
            </label>
            <select
              name="occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs cursor-pointer"
            >
              <option value="Diwali & Festive Gifting">Diwali &amp; Festive Gifting</option>
              <option value="Employee Welcome & Wellness Kit">Employee Welcome &amp; Wellness Kit</option>
              <option value="VIP Client Keepsake Hamper">VIP Client Keepsake Hamper</option>
              <option value="Wedding / Celebration Favours">Wedding &amp; Celebration Favours</option>
              <option value="Wholesale Cafeteria / Gym / Retail Resale">Wholesale Cafeteria / Gym / Retail Resale</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
              Target Delivery Date
            </label>
            <input
              type="text"
              name="eventDate"
              placeholder="e.g. Next Month / Diwali Week"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>

          <div className="pt-4 sm:pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-amber-950">
              <input
                type="checkbox"
                name="customBranding"
                value="yes"
                defaultChecked
                className="w-4 h-4 rounded text-[#D84315] accent-[#D84315] cursor-pointer"
              />
              <span>Include Custom Brand Logo &amp; Festive Sleeve</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
            Specific Requirements / Flavour Preferences (Optional)
          </label>
          <textarea
            name="message"
            rows={3}
            placeholder="e.g. We would like a mix of Himalayan Pink Salt, Peri Peri, and Truffle in 250g packs..."
            className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-warm-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPending ? "hourglass_empty" : "send"}
            </span>
            <span>{isPending ? "Submitting RFQ..." : "Request Official Corporate Quotation"}</span>
          </button>

          <a
            href={whatsappQuoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp RFQ</span>
          </a>
        </div>
      </form>
    </div>
  );
}
