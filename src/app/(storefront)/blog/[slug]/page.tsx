import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { MarkdownRenderer } from "@/components/storefront/MarkdownRenderer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug, isPublished: true },
  });

  if (!blog) return {};

  const title = blog.metaTitle || `${blog.title} | Makhana Gold Blog`;
  const description = blog.metaDescription || blog.excerpt || blog.title;
  const cover = blog.coverImage || "/images/vibrant/hero.jpg";

  return {
    title,
    description,
    keywords: blog.metaKeywords || undefined,
    alternates: {
      canonical: blog.canonicalUrl || `/blog/${blog.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://makhanagold.com/blog/${blog.slug}`,
      siteName: "Makhana Gold",
      images: [{ url: cover }],
      type: "article",
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [blog.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
  };
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const blog = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug, isPublished: true },
  });

  if (!blog) notFound();

  // Fetch 2 relevant products for in-article direct shopping conversion
  const featuredProducts = await prisma.product.findMany({
    where: { status: "active" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1, include: { inventoryStock: true } },
      category: true,
      attributes: true,
    },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  // Fetch 2 related articles
  const relatedBlogs = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: blog.id },
    },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  // Schema.org BlogPosting Structured Data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image: blog.coverImage ? [`https://makhanagold.com${blog.coverImage}`] : undefined,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: blog.authorName,
      jobTitle: blog.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "Makhana Gold",
      logo: {
        "@type": "ImageObject",
        url: "https://makhanagold.com/images/logo/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://makhanagold.com/blog/${blog.slug}`,
    },
  };

  const shareUrl = `https://makhanagold.com/blog/${blog.slug}`;
  const shareText = encodeURIComponent(`${blog.title} - Read on Makhana Gold: ${shareUrl}`);

  return (
    <>
      {/* 🚀 Google Structured Data (JSON-LD) for Instant Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-5 sm:px-gutter py-10 sm:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-8">
          <ol className="flex items-center space-x-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary transition-colors">
                Journal
              </Link>
            </li>
            <li>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </li>
            <li aria-current="page">
              <span className="text-primary font-semibold truncate max-w-xs">{blog.category}</span>
            </li>
          </ol>
        </nav>

        {/* Article Meta Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <span className="inline-block bg-[#FAF6EE] text-[#D84315] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-900/10 mb-4">
            {blog.category}
          </span>

          <h1 className="font-headline-lg text-3xl sm:text-5xl font-black text-[#1C150C] mb-6 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed mb-6 font-medium">
              {blog.excerpt}
            </p>
          )}

          {/* Author Pill & Meta details */}
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-on-surface-variant pt-4 border-t border-amber-900/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-amber-900/15 overflow-hidden relative">
                <Image
                  src={blog.authorAvatar || "/images/logo/logo.png"}
                  alt={blog.authorName}
                  fill
                  sizes="32px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="text-left">
                <p className="font-bold text-[#1C150C]">{blog.authorName}</p>
                <p className="text-[10px] text-amber-800">{blog.authorRole}</p>
              </div>
            </div>

            <span>•</span>
            <span className="font-semibold">
              {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span>•</span>
            <span className="font-bold text-amber-900">⏱️ {blog.readingTimeMinutes} min read</span>
          </div>
        </header>

        {/* Big Hero Cover Image */}
        <div className="relative w-full h-[320px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl mb-12 border border-amber-900/15">
          <Image
            src={blog.coverImage || "/images/vibrant/hero.jpg"}
            alt={blog.title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            className="object-cover"
          />
        </div>

        {/* Main Article Rich Typography */}
        <div className="mb-16">
          <MarkdownRenderer content={blog.content} />
        </div>

        {/* 🛍️ "Mentioned Superfoods" Direct Buy Bridge Widget */}
        <div className="my-14 p-8 bg-gradient-to-br from-[#FAF6EE] to-amber-50 rounded-3xl border border-amber-900/15 shadow-warm-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D84315] block mb-1">
                Harvest Store Direct
              </span>
              <h3 className="font-headline-sm text-xl font-extrabold text-amber-950">
                Mentioned In This Article
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#D84315] hover:underline flex items-center gap-1"
            >
              <span>Explore All Products</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredProducts.map((p) => (
              <ProductGridCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Social Share Strip */}
        <div className="p-6 bg-white rounded-2xl border border-amber-900/10 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4 mb-16">
          <span className="font-label-md text-xs uppercase tracking-widest text-amber-950 font-black">
            📢 Share this Wellness Guide:
          </span>

          <div className="flex items-center gap-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all"
            >
              <span>WhatsApp</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-125 transition-all"
            >
              <span>X (Twitter)</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all"
            >
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Related Articles Strip */}
        {relatedBlogs.length > 0 && (
          <section className="pt-10 border-t border-amber-900/10">
            <h3 className="font-headline-sm text-2xl font-black text-[#1C150C] mb-6">
              More From Superfoods Journal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="bg-white p-5 rounded-2xl border border-amber-900/10 hover:border-amber-400 hover:shadow-lg transition-all group flex gap-4 items-center"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#FAF6EE]">
                    <Image
                      src={item.coverImage || "/images/vibrant/hero.jpg"}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#D84315] block mb-1">
                      {item.category}
                    </span>
                    <h4 className="font-headline-sm text-sm font-bold text-on-surface group-hover:text-[#D84315] line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      ⏱️ {item.readingTimeMinutes} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
