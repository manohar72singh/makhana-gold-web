"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront route error:", error);
  }, [error]);

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-24 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-5xl text-amber-500 mb-4">
        error_outline
      </span>
      <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface mb-3">
        Something went wrong
      </h1>
      <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md mb-8">
        We&apos;re having trouble loading this page right now. Please try again in a moment.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full border border-amber-500/40 text-on-surface font-bold text-sm hover:bg-amber-500/10 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
