import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-gutter bg-surface">
      <span className="material-symbols-outlined text-6xl text-primary-container mb-lg">
        search_off
      </span>
      <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">
        Page Not Found
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-xl">
        We couldn&apos;t find the page you were looking for. It may have been moved or
        no longer exists.
      </p>
      <Link
        href="/"
        className="bg-[#D84315] text-white px-8 py-4 rounded-lg font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
