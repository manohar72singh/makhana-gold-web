"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-10 sm:mt-14 pt-6 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Items count */}
      <span className="text-xs text-amber-900/70 font-semibold order-2 sm:order-1">
        Showing <span className="font-bold text-amber-950">{startItem}–{endItem}</span> of{" "}
        <span className="font-bold text-amber-950">{totalItems}</span> harvests
      </span>

      {/* Pagination Controls */}
      <nav aria-label="Pagination" className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-amber-900/15 bg-white text-amber-950 hover:bg-[#FAF6EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-amber-900/50 font-bold">
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-[#D84315] text-white shadow-warm-1 font-black scale-105"
                    : "bg-white text-amber-950 border border-amber-900/15 hover:bg-[#FAF6EE]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-amber-900/15 bg-white text-amber-950 hover:bg-[#FAF6EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </nav>
    </div>
  );
}
