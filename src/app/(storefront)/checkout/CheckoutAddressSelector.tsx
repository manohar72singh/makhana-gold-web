"use client";

import { useState } from "react";

export interface SavedAddress {
  id: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefaultShipping: boolean;
}

const STATES = [
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

export function CheckoutAddressSelector({
  savedAddresses,
  defaultName = "",
  defaultPhone = "",
}: {
  savedAddresses: SavedAddress[];
  defaultName?: string;
  defaultPhone?: string;
}) {
  const defaultAddr = savedAddresses.find((a) => a.isDefaultShipping) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">(
    defaultAddr ? defaultAddr.id : "new"
  );

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div>
        <h3 className="font-label-md text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-label-sm text-xs text-on-surface font-bold block mb-1">
              Full Name *
            </label>
            <input
              name="name"
              required
              defaultValue={defaultName}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="font-label-sm text-xs text-on-surface font-bold block mb-1">
              Mobile Number (+91) *
            </label>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={defaultPhone}
              placeholder="10-digit mobile number"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="pt-4 border-t border-amber-900/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-label-md text-xs font-bold text-amber-800 uppercase tracking-wider">
            Delivery Location
          </h3>
          {savedAddresses.length > 0 && selectedAddressId !== "new" && (
            <button
              type="button"
              onClick={() => setSelectedAddressId("new")}
              className="text-xs font-bold text-amber-700 hover:text-[#E64A19] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {/* Saved Addresses Cards Grid */}
        {savedAddresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-600 ring-2 ring-amber-500/30"
                      : "bg-[#FAF6EE] border-amber-900/10 hover:border-amber-500/40 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-amber-900/10 text-amber-900">
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefaultShipping && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-2 leading-relaxed">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1 font-mono">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <span>{isSelected ? "Delivering Here" : "Deliver to this address"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden Input for Selected Address ID */}
        {selectedAddressId !== "new" && (
          <input type="hidden" name="savedAddressId" value={selectedAddressId} />
        )}

        {/* New Address Form (if selected "new" or no saved addresses) */}
        {selectedAddressId === "new" && (
          <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-amber-900/15 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Enter New Address
              </h4>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAddressId(defaultAddr ? defaultAddr.id : savedAddresses[0].id)}
                  className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  Choose from saved addresses
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  Address Label (e.g. Home, Office, Gifting)
                </label>
                <input
                  name="addressLabel"
                  defaultValue="Home"
                  placeholder="e.g. Home"
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  Street Address / Flat / Building *
                </label>
                <input
                  name="line1"
                  required
                  placeholder="House no, Building, Street, Area"
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  PIN Code *
                </label>
                <input
                  name="pincode"
                  required
                  placeholder="e.g. 110001"
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  City *
                </label>
                <input
                  name="city"
                  required
                  placeholder="City / Town"
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  State *
                </label>
                <select
                  name="state"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                >
                  <option disabled value="">
                    Select State
                  </option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                  Landmark (Optional)
                </label>
                <input
                  name="landmark"
                  placeholder="Near temple, hospital, etc."
                  className="w-full bg-white border border-amber-900/15 rounded-2xl px-4 py-2.5 text-sm text-[#1C150C] focus:border-amber-700 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveToProfile"
                  name="saveToProfile"
                  defaultChecked
                  className="w-4 h-4 rounded text-amber-700 accent-amber-700 cursor-pointer"
                />
                <label htmlFor="saveToProfile" className="text-xs font-semibold text-on-surface cursor-pointer select-none">
                  Save this address to my profile for future orders
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
