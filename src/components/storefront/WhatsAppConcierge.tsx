"use client";

import { useState, useEffect } from "react";

export function WhatsAppConcierge({
  whatsappNumber = "916001684216",
  storeName = "Makhana Gold",
}: {
  whatsappNumber?: string;
  storeName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Clean phone number (remove non-digits, ensure country code)
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "") || "916001684216";
  const defaultText = encodeURIComponent(
    `Namaste ${storeName}! 🙏 I'd like to ask a question / place an order for roasted makhana.`
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${defaultText}`;

  useEffect(() => {
    // Show gentle prompt bubble after 4 seconds if not previously dismissed
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("wa_prompt_dismissed");
      if (!dismissed) {
        setIsOpen(true);
        setHasPrompted(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    sessionStorage.setItem("wa_prompt_dismissed", "true");
  }

  return (
    <aside aria-label="WhatsApp Concierge" className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Prompt Card */}
      {isOpen && (
        <div className="mb-3 max-w-[280px] sm:max-w-xs bg-white text-on-surface rounded-2xl p-4 shadow-warm-2 border border-amber-900/10 animate-in fade-in slide-in-from-bottom-3 duration-300 relative">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss WhatsApp prompt"
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-sm"
          >
            ✕
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="relative w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-base shadow-xs shrink-0 font-bold">
              <span>MG</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="font-bold text-xs text-amber-950">Makhana Gold Concierge</p>
              <p className="text-[10px] text-emerald-800 font-semibold">Online • Fast Response</p>
            </div>
          </div>

          <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
            Need help choosing a flavour or prefer to <strong>order via WhatsApp</strong>?
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Chat on WhatsApp</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      )}

      {/* Floating Green WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Makhana Gold on WhatsApp"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Subtle Pulse Rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />

        {/* WhatsApp Icon SVG */}
        <svg
          className="w-7 h-7 fill-current relative z-10 transition-transform group-hover:rotate-6"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.769.814 2.796.814 3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.828c0 5.518-4.482 10-10 10-1.748 0-3.385-.45-4.819-1.238l-4.181 1.097 1.116-4.081c-.886-1.488-1.396-3.226-1.396-5.088 0-5.518 4.482-10 10-10s10 4.482 10 10z" />
        </svg>

        {/* Quick Tooltip on Desktop Hover */}
        <span className="hidden md:group-hover:flex absolute right-16 top-1/2 -translate-y-1/2 bg-neutral-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg items-center gap-1">
          <span>Order on WhatsApp</span>
        </span>
      </a>
    </aside>
  );
}
