"use client";

import { useState } from "react";
import { TrackingStep } from "@/lib/logistics";

export function OrderTrackingTimeline({
  steps,
  trackingNumber,
  courierPartner,
  trackingUrl,
}: {
  steps: TrackingStep[];
  trackingNumber?: string | null;
  courierPartner?: string | null;
  trackingUrl?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopyAwb() {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-ambient space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant/20 pb-4">
        <div>
          <span className="font-label-sm text-[11px] text-amber-700 uppercase font-bold tracking-widest block mb-0.5">
            Logistics & Delivery
          </span>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            Live Order Tracking
          </h3>
        </div>

        {trackingNumber && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAwb}
              className="bg-[#FAF6EE] border border-amber-900/15 hover:border-amber-500/40 text-[#2B1B04] px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="font-bold">{trackingNumber}</span>
              <span className="material-symbols-outlined text-[14px] text-amber-700">
                {copied ? "check" : "content_copy"}
              </span>
            </button>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold font-label-md uppercase tracking-wider transition-all inline-flex items-center gap-1 shadow-xs"
              >
                <span>Track on {courierPartner?.split(" ")[0] || "Courier"}</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Visual Timeline Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAE4D7]">
        {steps.map((step) => {
          return (
            <div key={step.step} className="relative flex items-start gap-4">
              {/* Step Circle Icon */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center -ml-6 sm:-ml-8 shrink-0 z-10 transition-all ${
                  step.isCompleted
                    ? "bg-emerald-600 text-white shadow-xs"
                    : step.isCurrent
                      ? "bg-[#E64A19] text-white ring-4 ring-orange-500/20 shadow-xs animate-pulse"
                      : "bg-[#FAF6EE] text-gray-400 border border-gray-300"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                  {step.isCompleted ? "check" : step.icon}
                </span>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4
                    className={`font-bold text-xs sm:text-sm ${
                      step.isCompleted || step.isCurrent
                        ? "text-on-surface"
                        : "text-on-surface-variant/60"
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-amber-800/80">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] sm:text-xs leading-relaxed mt-0.5 ${
                    step.isCompleted || step.isCurrent
                      ? "text-on-surface-variant"
                      : "text-on-surface-variant/50"
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
