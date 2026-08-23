"use client";

import { useState } from "react";
import { submitProductReviewAction } from "@/app/(storefront)/product/[slug]/actions";

export function ProductReviewFormClient({
  productId,
  productSlug,
  defaultName = "",
}: {
  productId: number;
  productSlug: string;
  defaultName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    formData.set("productId", String(productId));
    formData.set("slug", productSlug);

    try {
      await submitProductReviewAction(formData);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 3000);
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-500/40 px-5 py-2.5 rounded-2xl font-label-md text-xs uppercase tracking-wider font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <span className="material-symbols-outlined text-[18px] text-amber-700">rate_review</span>
        <span>Write a Review</span>
      </button>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-ambient mt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-amber-900/10">
        <div>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            Write Your Experience
          </h3>
          <p className="text-xs text-on-surface-variant">
            Share your thoughts on the crunch, aroma, and flavour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-on-surface-variant hover:text-primary text-xs font-bold"
        >
          Cancel
        </button>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-emerald-600">
            check_circle
          </span>
          <h4 className="font-bold text-sm text-emerald-900">Thank you for your review!</h4>
          <p className="text-xs text-emerald-700">
            Your review has been verified and published to the community.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-120 cursor-pointer focus:outline-none"
                  >
                    <span className={isFilled ? "text-amber-500" : "text-gray-300"}>★</span>
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-amber-800">
                {rating === 5 && "Outstanding (5/5)"}
                {rating === 4 && "Very Good (4/5)"}
                {rating === 3 && "Average (3/5)"}
                {rating === 2 && "Below Average (2/5)"}
                {rating === 1 && "Poor (1/5)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Your Name *
              </label>
              <input
                name="authorName"
                required
                defaultValue={defaultName}
                placeholder="e.g. Priya Iyer"
                className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 px-3.5 py-2.5 text-xs text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Headline / Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Unbelievable fresh crunch & perfect spice!"
                className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 px-3.5 py-2.5 text-xs text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Detailed Review *
            </label>
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Tell others what you loved about this artisanal roast..."
              className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 p-3 text-xs text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? "Publishing..." : "Submit Verified Review"}
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
