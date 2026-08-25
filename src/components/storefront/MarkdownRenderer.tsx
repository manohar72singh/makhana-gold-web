import { marked, Renderer } from "marked";

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to add id anchors to headings (for Table of Contents)
// and enforce alt tags on images
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const renderer = new Renderer();

// Override heading rendering to inject id + anchor link for TOC
renderer.heading = function ({ text, depth }) {
  const id = slugify(text);
  // Only anchor h2, h3, h4, h5 (skip h1 — that's the article title)
  if (depth >= 2 && depth <= 5) {
    return `<h${depth} id="${id}" class="scroll-mt-24">\n  <a class="heading-anchor" href="#${id}" title="Link to ${text}" aria-label="Anchor link for: ${text}">#</a>\n  ${text}\n</h${depth}>\n`;
  }
  return `<h${depth}>${text}</h${depth}>\n`;
};

// Override image rendering to enforce descriptive alt text
renderer.image = function ({ href, title, text }) {
  const alt = text || title || "Makhana Gold article image";
  const titleAttr = title ? ` title="${title}"` : alt ? ` title="${alt}"` : "";
  return `<img src="${href}" alt="${alt}"${titleAttr} loading="lazy" class="rounded-2xl w-full my-4" />`;
};

// Override link rendering to add title attributes
renderer.link = function ({ href, title, text }) {
  const titleAttr = title ? ` title="${title}"` : text ? ` title="${text}"` : "";
  const isExternal = href?.startsWith("http");
  const relAttr = isExternal ? ' rel="noopener noreferrer"' : "";
  const targetAttr = isExternal ? ' target="_blank"' : "";
  return `<a href="${href}"${titleAttr}${relAttr}${targetAttr}>${text}</a>`;
};

marked.use({ renderer });

export function MarkdownRenderer({ content }: { content: string }) {
  // Pre-process GitHub alerts like > [!TIP] or > [!NOTE]
  let processed = content
    .replace(
      /> \[!TIP\]\s*([\s\S]*?)(?=\n\n|$)/g,
      '<div class="my-6 p-5 rounded-2xl bg-amber-500/10 border-l-4 border-[#D84315] text-amber-950 font-medium text-sm flex gap-3 items-start"><span class="text-xl">💡</span><div><strong>Health Tip:</strong> $1</div></div>'
    )
    .replace(
      /> \[!NOTE\]\s*([\s\S]*?)(?=\n\n|$)/g,
      '<div class="my-6 p-5 rounded-2xl bg-blue-500/10 border-l-4 border-blue-600 text-blue-950 font-medium text-sm flex gap-3 items-start"><span class="text-xl">ℹ️</span><div><strong>Note:</strong> $1</div></div>'
    );

  const html = marked.parse(processed) as string;

  return (
    <div
      className="prose-blog-content leading-relaxed text-[#2B1B04] space-y-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
