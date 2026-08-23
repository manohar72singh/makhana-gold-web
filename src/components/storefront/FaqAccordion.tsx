"use client";

import { useState } from "react";
import { FaqCategoryData } from "@/lib/content";

const DEFAULT_FAQ_CATEGORIES: FaqCategoryData[] = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping and dispatch take?",
        a: "All orders are hand-packed within 24 hours of roasting. Standard delivery takes 3-5 business days across all major metro and tier-1 cities in India. Tracking details are automatically emailed.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! Free standard delivery is automatically unlocked on all orders of ₹500 or more.",
      },
      {
        q: "Can I modify my shipping address after placing an order?",
        a: "If your order has not yet left our facility, contact mmakhanaltd@gmail.com within 2 hours of placing the order to update your details.",
      },
    ],
  },
  {
    category: "Quality & Sourcing",
    items: [
      {
        q: "Where is your makhana sourced?",
        a: "We source directly from generational wetland farming communities in Darbhanga and Madhubani, Bihar — the traditional heartland producing the largest, purest fox nut seeds in the world.",
      },
      {
        q: "How are your flavoured makhana prepared?",
        a: "Our fox nuts are slow dry-roasted in artisanal cast pans without deep frying in palm oil. We use natural spice blends and cold-pressed oils for seasoning.",
      },
      {
        q: "Are all products gluten-free and vegan?",
        a: "Yes, all our roasted and flavoured makhana products are 100% gluten-free, vegetarian, non-GMO, and free from synthetic preservatives.",
      },
    ],
  },
  {
    category: "Returns & Corporate",
    items: [
      {
        q: "What is your return & replacement policy?",
        a: "We stand by our quality promise. If your package arrives damaged or you are unsatisfied with freshness, request a replacement within 7 days of delivery.",
      },
      {
        q: "Do you offer custom corporate gifting or bulk orders?",
        a: "Yes! We specialize in bespoke corporate gift hampers and festive bundles with custom branding. Reach out through our contact form for corporate pricing.",
      },
    ],
  },
];

export function FaqAccordion({
  categories = DEFAULT_FAQ_CATEGORIES,
}: {
  categories?: FaqCategoryData[];
}) {
  const displayCategories = categories.length > 0 ? categories : DEFAULT_FAQ_CATEGORIES;
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItem, setOpenItem] = useState<number | null>(0);

  const currentCategory = displayCategories[activeCategory] || displayCategories[0];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-3 overflow-x-auto no-scrollbar">
        {displayCategories.map((cat, i) => (
          <button
            key={cat.category}
            onClick={() => {
              setActiveCategory(i);
              setOpenItem(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-label-md uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeCategory === i
                ? "bg-primary text-white font-bold shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {currentCategory?.items.map((faq, i) => (
          <div
            key={faq.q}
            className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-xs transition-colors"
          >
            <button
              onClick={() => setOpenItem(openItem === i ? null : i)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-surface-container-low/50 transition-colors cursor-pointer"
            >
              <span className="font-headline-sm text-sm md:text-base font-bold text-on-surface">
                {faq.q}
              </span>
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 ml-3">
                <span className="material-symbols-outlined text-[18px]">
                  {openItem === i ? "remove" : "add"}
                </span>
              </span>
            </button>
            {openItem === i && (
              <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-on-surface-variant/90 leading-relaxed border-t border-outline-variant/15">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
