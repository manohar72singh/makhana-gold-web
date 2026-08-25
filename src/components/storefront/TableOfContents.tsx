"use client";

import { useState, useEffect, useRef } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3, 4 = h4
}

interface TableOfContentsProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractHeadings(markdown: string): TOCItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, "").replace(/\*/g, "").trim();
    const id = slugify(text);
    items.push({ id, text, level });
  }
  return items;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);
  const headings = extractHeadings(content);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="bg-[#FAF6EE] border border-amber-900/15 rounded-2xl overflow-hidden shadow-xs mb-8 lg:mb-0"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="toc-list"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-amber-100/40 transition-colors"
      >
        <span className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-amber-900">
          <span className="material-symbols-outlined text-[16px] text-[#D84315]">menu_book</span>
          Contents ({headings.length})
        </span>
        <span
          className={`material-symbols-outlined text-amber-800 text-[18px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <ol id="toc-list" className="px-5 pb-5 pt-1 space-y-1.5 list-none border-t border-amber-900/10 max-h-[70vh] overflow-y-auto">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
              <a
                href={`#${h.id}`}
                title={h.text}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`text-xs leading-snug block py-1 transition-all rounded-md px-1.5 -mx-1.5 font-medium hover:text-[#D84315] hover:bg-amber-100/60 ${
                  activeId === h.id
                    ? "text-[#D84315] font-bold bg-amber-200/50 border-l-2 border-[#D84315] pl-2"
                    : "text-on-surface-variant"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
