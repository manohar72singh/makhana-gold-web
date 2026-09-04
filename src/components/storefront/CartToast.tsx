"use client";

import { useEffect, useState } from "react";

type CartAddedDetail = {
  name?: string;
  image?: string;
};

type ToastItem = {
  id: number;
  name: string;
  image?: string;
  leaving: boolean;
};

export function CartToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleAdded(e: Event) {
      const detail = (e as CustomEvent<CartAddedDetail>).detail || {};
      const id = Date.now() + Math.random();

      setToasts((t) => [...t, { id, name: detail.name || "Item", image: detail.image, leaving: false }]);

      setTimeout(() => {
        setToasts((t) => t.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
      }, 2200);

      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 2500);
    }

    window.addEventListener("cart:added", handleAdded);
    return () => window.removeEventListener("cart:added", handleAdded);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2.5 items-end pointer-events-none max-w-[calc(100vw-2.5rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 bg-white border border-emerald-200 shadow-warm-2 rounded-2xl pl-3 pr-4 py-3 max-w-xs ${
            toast.leaving
              ? "animate-out fade-out slide-out-to-right-4 duration-300"
              : "animate-in slide-in-from-bottom-4 fade-in duration-300"
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-badge-pop">
            <span className="material-symbols-outlined text-[18px]">check</span>
          </span>
          <div className="min-w-0">
            <p className="font-bold text-xs text-amber-950 leading-tight">Added to Bag!</p>
            <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">{toast.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function dispatchCartAdded(detail: CartAddedDetail = {}) {
  window.dispatchEvent(new CustomEvent("cart:added", { detail }));
}
