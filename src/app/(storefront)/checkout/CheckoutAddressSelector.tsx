"use client";

import { useState } from "react";
import { AddressFormFields } from "@/components/storefront/AddressFormFields";

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
              minLength={2}
              defaultValue={defaultName}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="font-label-sm text-xs text-on-surface font-bold block mb-1">
              Mobile Number (10 Digits) *
            </label>
            <input
              name="phone"
              type="tel"
              required
              inputMode="tel"
              pattern="^[6-9][0-9]{9}$"
              maxLength={10}
              title="Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
              defaultValue={defaultPhone}
              placeholder="e.g. 9876543210"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
            />
            <span className="text-[10px] text-amber-900/60 mt-1 block">
              Required for courier delivery coordination &amp; dispatch updates
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="pt-4 border-t border-amber-900/10">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div>
            <h3 className="font-label-md text-xs font-bold text-amber-800 uppercase tracking-wider">
              Delivery Address *
            </h3>
            <p className="text-[11px] text-amber-900/60">
              {savedAddresses.length > 0
                ? selectedAddressId === "new"
                  ? "Enter your new address below (all fields mandatory)"
                  : "Select your preferred delivery destination (Default pre-selected)"
                : "Enter your complete shipping address (all fields mandatory)"}
            </p>
          </div>
          {savedAddresses.length > 0 && selectedAddressId !== "new" && (
            <button
              type="button"
              onClick={() => setSelectedAddressId("new")}
              className="text-xs font-bold text-amber-900 hover:text-white bg-amber-100 hover:bg-[#D84315] border border-amber-300 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>+ Add New Address</span>
            </button>
          )}
          {savedAddresses.length > 0 && selectedAddressId === "new" && (
            <button
              type="button"
              onClick={() => setSelectedAddressId(defaultAddr ? defaultAddr.id : savedAddresses[0].id)}
              className="text-xs font-bold text-amber-800 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Use Default / Saved Address</span>
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
                      ? "bg-amber-500/10 border-amber-600 ring-2 ring-amber-500/30 shadow-xs"
                      : "bg-[#FAF6EE] border-amber-900/10 hover:border-amber-500/40 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-amber-900/10 text-amber-900">
                        <span className="material-symbols-outlined text-[13px]">
                          {addr.label === "Office" ? "apartment" : addr.label === "Home" ? "home" : "location_on"}
                        </span>
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefaultShipping && (
                        <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">verified</span>
                          Default Address
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
                    <span>{isSelected ? "Delivering Here (Selected)" : "Deliver to this address"}</span>
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
          <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-2xl border-2 border-amber-500/30 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-amber-900/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-lg">add_location</span>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Enter New Delivery Address
                </h4>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md font-bold uppercase">
                All Fields Mandatory *
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressFormFields compact />

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
