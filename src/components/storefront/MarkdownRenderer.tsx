import { marked } from "marked";

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

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
