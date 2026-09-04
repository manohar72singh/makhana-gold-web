"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "@/app/(storefront)/cart/actions";
import { dispatchCartAdded } from "./CartToast";

type QuickViewProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  images: { url: string; altText: string | null }[];
  variants: { id: number; packSize: string; price: string }[];
};

export function QuickViewTrigger({ product }: { product: QuickViewProduct }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="absolute bottom-md left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-md py-xs rounded-full shadow-warm-1 z-10"
      >
        Quick View
      </button>
      {open && <QuickViewModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickViewModal({
  product,
  onClose,
}: {
  product: QuickViewProduct;
  onClose: () => void;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const image = product.images[0];

  function handleAddToCart() {
    const formData = new FormData();
    formData.set("variantId", String(selectedVariant.id));
    formData.set("quantity", "1");
    startTransition(async () => {
      await addToCartAction(formData);
      setAdded(true);
      dispatchCartAdded({ name: product.name });
      setTimeout(() => setAdded(false), 1600);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-warm-2 overflow-y-auto grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square bg-surface-variant">
          {image && (
            <Image src={image.url} alt={image.altText ?? product.name} fill sizes="50vw" className="object-cover" />
          )}
        </div>
        <div className="p-lg flex flex-col">
          <button
            onClick={onClose}
            aria-label="Close"
            className="self-end p-2 -m-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">{product.name}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-3">
            {product.description}
          </p>

          {selectedVariant && (
            <span className="font-headline-sm text-headline-sm text-primary mb-md">
              ₹{selectedVariant.price}
            </span>
          )}

          <div className="flex gap-sm flex-wrap mb-lg">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`px-4 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors ${
                  v.id === selectedVariant.id
                    ? "border-2 border-primary-container text-primary"
                    : "border border-outline-variant text-on-surface-variant"
                }`}
              >
                {v.packSize}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={pending}
            className={`w-full py-3 rounded-lg text-white font-label-md text-label-md uppercase tracking-wider transition-all duration-300 disabled:opacity-60 mb-sm flex items-center justify-center gap-1.5 ${
              added ? "bg-emerald-600 scale-102" : "bg-[#D84315] hover:opacity-90"
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${pending ? "animate-spin" : added ? "animate-badge-pop" : ""}`}>
              {pending ? "progress_activity" : added ? "check_circle" : "add_shopping_cart"}
            </span>
            <span>{pending ? "Adding…" : added ? "Added!" : "Add to Cart"}</span>
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="text-center font-label-sm text-label-sm text-primary hover:underline"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
