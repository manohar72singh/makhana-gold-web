"use client";

import { useState } from "react";

export function CheckoutB2bSection({
  defaultIsB2b = false,
  defaultCompanyName = "",
  defaultGstin = "",
}: {
  defaultIsB2b?: boolean;
  defaultCompanyName?: string;
  defaultGstin?: string;
}) {
  const [isB2b, setIsB2b] = useState(defaultIsB2b || Boolean(defaultGstin));
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [gstin, setGstin] = useState(defaultGstin);
  const [gstinError, setGstinError] = useState<string | null>(null);

  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  function handleGstinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setGstin(val);
    if (val.length === 15) {
      if (!GSTIN_REGEX.test(val)) {
        setGstinError("Invalid GSTIN format. Check state code or checksum digit.");
      } else {
        setGstinError(null);
      }
    } else if (val.length > 0) {
      setGstinError(`${15 - val.length} more characters needed (15-digit GSTIN)`);
    } else {
      setGstinError(null);
    }
  }

  return (
    <div className="pt-5 border-t border-amber-900/15">
      {/* B2B Toggle Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/15 hover:border-amber-600/50 transition-all cursor-pointer">
        <input
          type="checkbox"
          id="isB2bCheckbox"
          name="isB2bCheckbox"
          checked={isB2b}
          onChange={(e) => setIsB2b(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-[#D84315] accent-[#D84315] cursor-pointer"
        />
        <label htmlFor="isB2bCheckbox" className="text-xs text-[#1C150C] cursor-pointer select-none">
          <span className="font-bold flex items-center gap-1.5 text-amber-950">
            <span className="material-symbols-outlined text-[16px] text-[#D84315]">corporate_fare</span>
            Buying for a Business / Company? (Claim GST Input Tax Credit)
          </span>
          <span className="text-[11px] text-amber-900/70 block mt-0.5">
            Check this to receive an official B2B Tax Invoice with your Company Name and GSTIN.
          </span>
        </label>
      </div>

      {/* Hidden input to pass boolean status in FormData */}
      <input type="hidden" name="isB2b" value={isB2b ? "true" : "false"} />

      {/* Expandable B2B Details Form */}
      {isB2b && (
        <div className="mt-3 p-5 rounded-2xl bg-white border-2 border-amber-500/30 space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-300 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-900/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 text-lg">receipt_long</span>
              <h4 className="text-xs font-bold text-[#1C150C] uppercase tracking-wider">
                Business &amp; GST Details (For Tax Invoice)
              </h4>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md font-bold uppercase inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-emerald-600">verified</span>
              ITC Eligible
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company / Trade Name */}
            <div>
              <label htmlFor="companyName" className="font-label-sm text-xs text-on-surface font-bold block mb-1">
                Company / Registered Trade Name *
              </label>
              <div className="relative">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required={isB2b}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Mithila Agro Traders Pvt. Ltd."
                  className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-900/40 text-[18px]">
                  apartment
                </span>
              </div>
            </div>

            {/* GSTIN */}
            <div>
              <label htmlFor="gstin" className="font-label-sm text-xs text-on-surface font-bold block mb-1">
                GSTIN Number (15 Digits) *
              </label>
              <div className="relative">
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  required={isB2b}
                  maxLength={15}
                  value={gstin}
                  onChange={handleGstinChange}
                  placeholder="e.g. 10AAACM1234F1Z5"
                  className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono uppercase tracking-wider"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-900/40 text-[18px]">
                  badge
                </span>
              </div>

              {gstinError ? (
                <span className="text-[10px] text-red-600 font-medium mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {gstinError}
                </span>
              ) : gstin.length === 15 ? (
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Valid 15-character GSTIN format
                </span>
              ) : (
                <span className="text-[10px] text-amber-900/60 mt-1 block">
                  Format: 2-digit State Code + 10-digit PAN + Entity Code + Z + Checksum
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
