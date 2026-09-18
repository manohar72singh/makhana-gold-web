"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderAction } from "./actions";

export function ReorderButtonClient({
  orderId,
  variant = "compact",
}: {
  orderId: number;
  variant?: "button" | "compact";
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleReorder() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await reorderAction(orderId);
        if (res.success) {
          router.push("/cart");
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to re-order items.");
      }
    });
  }

  if (variant === "button") {
    return (
      <div>
        <button
          type="button"
          onClick={handleReorder}
          disabled={isPending}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white font-label-md text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 disabled:opacity-70 cursor-pointer"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding to Bag...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">repeat</span>
              <span>Re-Order This Harvest</span>
            </>
          )}
        </button>
        {errorMessage && (
          <p className="text-[11px] text-red-600 mt-1 font-medium">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleReorder}
        disabled={isPending}
        title="Quick Re-Order items from this purchase"
        className="text-xs font-label-md uppercase tracking-wider text-amber-950 border border-amber-900/20 bg-amber-50/80 hover:bg-amber-100/90 px-3.5 py-2 rounded-xl transition-all font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 shadow-2xs active:scale-98"
      >
        {isPending ? (
          <>
            <span className="w-3 h-3 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[15px] text-[#D84315]">repeat</span>
            <span>Re-Order</span>
          </>
        )}
      </button>
      {errorMessage && (
        <p className="text-[10px] text-red-600 mt-1 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
