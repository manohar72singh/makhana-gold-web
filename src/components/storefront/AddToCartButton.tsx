"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/(storefront)/cart/actions";
import { dispatchCartAdded } from "./CartToast";

export function AddToCartButton({
  variantId,
  quantity = 1,
  productName,
}: {
  variantId: number;
  quantity?: number;
  productName?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    const formData = new FormData();
    formData.set("variantId", String(variantId));
    formData.set("quantity", String(quantity));
    startTransition(async () => {
      await addToCartAction(formData);
      setJustAdded(true);
      dispatchCartAdded({ name: productName });
      setTimeout(() => setJustAdded(false), 1600);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`font-label-md text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-vermillion-glow cursor-pointer active:scale-95 font-bold text-white ${
        justAdded
          ? "bg-emerald-600 scale-105"
          : "bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110"
      } ${pending ? "opacity-70" : ""}`}
    >
      <span
        className={`material-symbols-outlined text-[16px] ${
          pending ? "animate-spin" : justAdded ? "animate-badge-pop" : ""
        }`}
      >
        {pending ? "progress_activity" : justAdded ? "check_circle" : "add_shopping_cart"}
      </span>
      <span>{pending ? "Adding…" : justAdded ? "Added!" : "Add"}</span>
    </button>
  );
}
