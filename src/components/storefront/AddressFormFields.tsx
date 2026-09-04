"use client";

import { useState } from "react";

export const ADDRESS_LABELS = ["Home", "Office", "Other"] as const;

const ADDRESS_LABEL_ICONS: Record<(typeof ADDRESS_LABELS)[number], string> = {
  Home: "home",
  Office: "apartment",
  Other: "location_on",
};

export const STATES = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "West Bengal",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Bihar",
  "Haryana",
  "Punjab",
  "Rajasthan",
  "Telangana",
  "Madhya Pradesh",
  "Kerala",
  "Andhra Pradesh",
  "Goa",
];

export function AddressFormFields({
  defaultLabel = "Home",
  defaultValues,
  compact = false,
}: {
  defaultLabel?: string;
  defaultValues?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  compact?: boolean;
}) {
  const [label, setLabel] = useState<string>(
    ADDRESS_LABELS.includes(defaultLabel as (typeof ADDRESS_LABELS)[number]) ? defaultLabel : "Home"
  );

  const inputClass = `w-full border border-amber-900/15 rounded-2xl px-4 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
    compact ? "py-2.5 bg-white" : "py-3 bg-[#FAF6EE] focus:bg-white"
  }`;

  return (
    <>
      <input type="hidden" name="label" value={label} />

      <div className="md:col-span-2">
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-2">
          Save Address As *
        </label>
        <div className="flex flex-wrap gap-2.5">
          {ADDRESS_LABELS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLabel(option)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                label === option
                  ? "bg-amber-500/15 border-amber-600 text-amber-950"
                  : "bg-white border-amber-900/15 text-on-surface-variant hover:border-amber-400"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ADDRESS_LABEL_ICONS[option]}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          Street Address / Flat / Building *
        </label>
        <input
          name="line1"
          required
          defaultValue={defaultValues?.line1}
          placeholder="Flat / House No., Apartment, Street, Landmark"
          className={inputClass}
        />
      </div>

      <div className="md:col-span-2">
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          Landmark / Area / Colony *
        </label>
        <input
          name="line2"
          required
          defaultValue={defaultValues?.line2 ?? undefined}
          placeholder="e.g. Near Shiv Temple / Opp. Metro Station / Sector 4"
          className={inputClass}
        />
      </div>

      <div>
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          PIN Code (6 Digits) *
        </label>
        <input
          name="pincode"
          required
          inputMode="numeric"
          pattern="^[1-9][0-9]{5}$"
          maxLength={6}
          title="Please enter a valid 6-digit Indian PIN code"
          defaultValue={defaultValues?.pincode}
          placeholder="e.g. 110001"
          className={inputClass}
        />
      </div>

      <div>
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          City *
        </label>
        <input
          name="city"
          required
          defaultValue={defaultValues?.city}
          placeholder="e.g. New Delhi"
          className={inputClass}
        />
      </div>

      <div>
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          State *
        </label>
        <select name="state" required defaultValue={defaultValues?.state ?? ""} className={inputClass}>
          <option disabled value="">
            Select Delivery State
          </option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-label-sm text-xs font-bold text-on-surface block mb-1.5">
          Country
        </label>
        <input
          disabled
          value="India"
          className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
        />
      </div>
    </>
  );
}
