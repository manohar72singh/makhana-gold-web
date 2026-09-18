"use client";

import { useState, useTransition } from "react";
import { cancelOrderAction } from "../actions";

export function CancelOrderButtonClient({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Ordered by mistake / Change of mind");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const CANCELLATION_REASONS = [
    "Ordered by mistake / Change of mind",
    "Want to change delivery address",
    "Want to choose different flavour or pack size",
    "Delivery timeline is later than expected",
    "Other reason",
  ];

  function handleCancelSubmit() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await cancelOrderAction(orderNumber, reason);
        if (res.success) {
          setIsOpen(false);
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to cancel order."
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-label-md uppercase tracking-wider text-neutral-600 hover:text-red-700 hover:bg-red-50 border border-neutral-300 hover:border-red-300 px-3.5 py-2 rounded-xl transition-all font-semibold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
      >
        <span className="material-symbols-outlined text-[15px]">cancel</span>
        <span>Cancel Order</span>
      </button>

      {/* Cancellation Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <span className="material-symbols-outlined text-2xl">error</span>
                <h3 className="font-headline-sm text-base font-bold text-neutral-900">
                  Cancel Order #{orderNumber}?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FSSAI Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-950">
                <span className="material-symbols-outlined text-[16px] text-[#D84315]">verified</span>
                <span>FSSAI Pre-Dispatch Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/80">
                As per food safety standards, gourmet food items cannot be cancelled once packed or dispatched. Your order is currently pre-dispatch and eligible for full immediate cancellation.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Reason for Cancellation:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-700"
              >
                {CANCELLATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Keep My Order
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isPending ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
