"use client";

import { useState } from "react";
import Link from "next/link";
import { validateCouponAction } from "./actions";

interface CartSummaryProps {
  subtotal: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
  taxRate?: number;
}

export function CartSummaryClient({
  subtotal,
  freeShippingThreshold = 500,
  shippingFee = 60,
  taxRate = 0.05,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState("GOLDEN15");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Discount calculation
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Shipping calculation
  const isFreeShipCoupon = appliedCoupon?.code === "FREESHIP";
  const shipping =
    subtotal >= freeShippingThreshold || isFreeShipCoupon ? 0 : shippingFee;

  // Tax on discounted subtotal
  const tax = discountedSubtotal * taxRate;
  const grandTotal = discountedSubtotal + shipping + tax;

  async function handleApplyCoupon(codeToApply?: string) {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setIsApplying(true);
    setCouponError(null);

    try {
      const res = await validateCouponAction(code, subtotal);
      if (res.success) {
        setAppliedCoupon({
          code: res.code!,
          discount: res.discount!,
          message: res.message!,
        });
        setCouponError(null);
      } else {
        setCouponError(res.error || "Failed to apply coupon");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Something went wrong. Please try again.");
    } finally {
      setIsApplying(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }

  const checkoutUrl = appliedCoupon
    ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
    : "/checkout";

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
      <h2 className="font-headline-md text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-3">
        Order Summary
      </h2>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between font-body-md text-on-surface-variant">
          <span>Bag Subtotal</span>
          <span className="text-on-surface font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>

        {/* Applied Discount Line */}
        {appliedCoupon && (
          <div className="flex justify-between font-body-md text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">local_offer</span>
              <span>Coupon ({appliedCoupon.code})</span>
            </span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-body-md text-on-surface-variant">
          <span>Estimated Delivery</span>
          <span className={shipping === 0 ? "text-emerald-700 font-bold" : "text-on-surface font-semibold"}>
            {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between font-body-md text-on-surface-variant">
          <span>Estimated GST (5%)</span>
          <span className="text-on-surface font-semibold">₹{tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Interactive Coupon Code Section */}
      <div className="mb-6 pt-4 border-t border-outline-variant/20">
        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
          Have a Coupon Code?
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                check_circle
              </span>
              <div>
                <span className="font-mono font-bold">{appliedCoupon.code}</span>
                <span className="text-[11px] text-emerald-700 block">{appliedCoupon.message}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                className="w-full bg-[#F9F7F0] border border-[#E5E2D9] rounded-xl px-3.5 py-2.5 text-xs uppercase tracking-wider focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono text-[#1C150C] font-bold"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={isApplying || !couponInput.trim()}
                className="px-4 py-2.5 rounded-xl border border-amber-900/20 bg-amber-500/15 text-amber-950 hover:bg-amber-700 hover:text-white font-label-sm text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isApplying ? "..." : "Apply"}
              </button>
            </div>

            {/* Quick Available Coupon Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-medium">Try:</span>
              <button
                type="button"
                onClick={() => {
                  setCouponInput("GOLDEN15");
                  handleApplyCoupon("GOLDEN15");
                }}
                className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
              >
                GOLDEN15 (15% OFF)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCouponInput("FREESHIP");
                  handleApplyCoupon("FREESHIP");
                }}
                className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
              >
                FREESHIP (Free Delivery)
              </button>
            </div>

            {/* Error message */}
            {couponError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{couponError}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Total & Checkout */}
      <div className="border-t border-outline-variant/30 pt-4 mb-6">
        <div className="flex justify-between items-baseline font-headline-sm text-xl font-bold text-on-surface">
          <span>Grand Total</span>
          <span className="text-[#1C150C] text-2xl font-bold">
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          All taxes, discounts and duties included.
        </p>
      </div>

      <Link
        href={checkoutUrl}
        className="w-full block bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white py-4 rounded-xl font-label-md text-xs uppercase tracking-widest transition-all text-center shadow-warm-1 hover:shadow-warm-2 cursor-pointer active:scale-98 font-bold"
      >
        Proceed to Secure Checkout
      </Link>

      {/* Trust badges below CTA */}
      <div className="mt-6 pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-2 text-center text-[11px] text-on-surface-variant">
        <div className="flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm text-amber-700">lock</span>
          <span>256-Bit SSL Encrypted</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm text-amber-700">verified_user</span>
          <span>100% Genuine Quality</span>
        </div>
      </div>
    </div>
  );
}
