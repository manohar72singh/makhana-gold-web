"use client";

import { useState } from "react";
import { generateFAQSchema } from "@/lib/seo";

export interface FAQItemData {
  question: string;
  answer: string;
}

interface PageFAQProps {
  faqs: FAQItemData[];
  title?: string;
  subtitle?: string;
}

export function PageFAQ({ faqs, title = "Frequently Asked Questions", subtitle }: PageFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const schema = generateFAQSchema(faqs);

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="py-10 md:py-14 px-5 sm:px-gutter"
    >
      {/* FAQ JSON-LD Schema — server-rendered by passing dangerouslySetInnerHTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="font-label-md text-xs uppercase tracking-widest text-amber-700 font-black block mb-2">
            Quick Answers
          </span>
          <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3" role="list">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const headingId = `faq-question-${idx}`;
            const panelId = `faq-answer-${idx}`;

            return (
              <div
                key={idx}
                role="listitem"
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
                  isOpen ? "border-amber-400 shadow-warm-1" : "border-amber-900/10 hover:border-amber-300"
                }`}
              >
                <button
                  id={headingId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface leading-snug">
                    {faq.question}
                  </h3>
                  <span
                    className={`material-symbols-outlined text-amber-700 text-[20px] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-5 border-t border-amber-900/8">
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
