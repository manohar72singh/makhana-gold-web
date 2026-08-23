import { ProductReviewFormClient } from "./ProductReviewFormClient";

interface ReviewItem {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  customer: {
    name: string | null;
    email: string;
  };
}

export function ProductReviewSection({
  productId,
  productSlug,
  productName,
  reviews,
  userName = "",
}: {
  productId: number;
  productSlug: string;
  productName: string;
  reviews: ReviewItem[];
  userName?: string;
}) {
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  // Calculate rating distribution
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      totalReviews > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / totalReviews) * 100
          )
        : star === 5
          ? 100
          : 0,
  }));

  return (
    <section className="border-t border-outline-variant/30 pt-12 md:pt-16 mb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
            Real Customer Voices
          </span>
          <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
            Customer Reviews & Ratings
          </h2>
        </div>

        <ProductReviewFormClient
          productId={productId}
          productSlug={productSlug}
          defaultName={userName}
        />
      </div>

      {/* Overview Cards & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Rating Overview */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient flex flex-col justify-center items-center text-center">
          <span className="text-5xl md:text-6xl font-bold text-amber-950 font-display-lg leading-none mb-2">
            {avgRating}
          </span>
          <div className="flex text-amber-500 text-lg mb-2">
            {"★".repeat(Math.round(Number(avgRating)))}
            {"☆".repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            Based on {totalReviews} verified community ratings
          </p>
          <div className="mt-4 pt-4 border-t border-amber-900/10 w-full flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>100% Authentic Customer Purchases</span>
          </div>
        </div>

        {/* Right Star Rating Breakdown Progress Bars */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-ambient flex flex-col justify-center">
          <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-2.5">
            {counts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="font-bold text-on-surface w-6 text-right">{star} ★</span>
                <div className="flex-1 h-3 rounded-full bg-[#FAF6EE] overflow-hidden border border-amber-900/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-on-surface-variant font-mono text-[11px] w-12 text-right">
                  {percentage}% ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Customer Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              Be the first to taste and review <strong className="text-on-surface">{productName}</strong>!
            </p>
            <ProductReviewFormClient
              productId={productId}
              productSlug={productSlug}
              defaultName={userName}
            />
          </div>
        ) : (
          reviews.map((review) => {
            const author = review.customer?.name || "Verified Customer";
            const initials = author.charAt(0).toUpperCase();

            return (
              <div
                key={review.id}
                className="bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-outline-variant/30 shadow-ambient hover:border-amber-500/40 transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-900 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                        <span>{author}</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          <span>Verified Buyer</span>
                        </span>
                      </h4>
                      <span className="text-[11px] text-on-surface-variant">
                        Reviewed on{" "}
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-amber-500 text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>

                {review.title && (
                  <h5 className="font-bold text-sm text-on-surface mb-1.5">
                    {review.title}
                  </h5>
                )}

                {review.body && (
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {review.body}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
