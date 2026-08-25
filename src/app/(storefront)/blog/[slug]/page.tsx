import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { MarkdownRenderer } from "@/components/storefront/MarkdownRenderer";
import { TableOfContents } from "@/components/storefront/TableOfContents";
import { BlogComments } from "@/components/storefront/BlogComments";
import { PageFAQ } from "@/components/storefront/PageFAQ";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  DEFAULT_BLOG_FAQS,
  type FAQItem,
} from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://makhanagold.com";

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
      url: `${SITE_URL}/blog/${blog.slug}`,
      siteName: "Makhana Gold",
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: `${blog.title} — Makhana Gold Superfoods Journal`,
        },
      ],
      type: "article",
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [blog.authorName],
      section: blog.category,
      tags: blog.tags ? blog.tags.split(",").map((t) => t.trim()) : undefined,
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
    include: {
      comments: {
        where: { isApproved: true, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          replies: {
            where: { isApproved: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
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

  // Parse per-blog FAQs or fall back to default
  let pageFaqs: FAQItem[] = DEFAULT_BLOG_FAQS;
  if (blog.blogFaqs) {
    try {
      const parsed = JSON.parse(blog.blogFaqs);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        pageFaqs = parsed;
      }
    } catch {
      // Use defaults if JSON is invalid
    }
  }

  // Schema.org Structured Data
  const articleSchema = generateArticleSchema({
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage,
    authorName: blog.authorName,
    authorRole: blog.authorRole,
    category: blog.category,
    tags: blog.tags,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    readingTimeMinutes: blog.readingTimeMinutes,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Superfoods Journal", url: "/blog" },
    { name: blog.category, url: `/blog?category=${encodeURIComponent(blog.category)}` },
    { name: blog.title, url: `/blog/${blog.slug}` },
  ]);

  const faqSchema = generateFAQSchema(pageFaqs);

  const shareUrl = `${SITE_URL}/blog/${blog.slug}`;
  const shareText = encodeURIComponent(`${blog.title} - Read on Makhana Gold: ${shareUrl}`);

  return (
    <>
      {/* 🚀 Structured Data — Article + BreadcrumbList + FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-6xl mx-auto px-5 sm:px-gutter py-10 sm:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-8">
          <ol className="flex items-center space-x-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" title="Makhana Gold Home" itemProp="item" className="hover:text-primary transition-colors">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li><span className="material-symbols-outlined text-xs">chevron_right</span></li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/blog" title="Makhana Gold Superfoods Journal" itemProp="item" className="hover:text-primary transition-colors">
                <span itemProp="name">Journal</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li><span className="material-symbols-outlined text-xs">chevron_right</span></li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
              <span className="text-primary font-semibold truncate max-w-xs" itemProp="name">{blog.category}</span>
              <meta itemProp="position" content="3" />
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
            <p className="article-excerpt font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed mb-6 font-medium">
              {blog.excerpt}
            </p>
          )}

          {/* Author Pill & Meta details */}
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-on-surface-variant pt-4 border-t border-amber-900/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-amber-900/15 overflow-hidden relative">
                <Image
                  src={blog.authorAvatar || "/images/logo/logo.png"}
                  alt={`${blog.authorName} — ${blog.authorRole}`}
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
            <time
              dateTime={blog.createdAt.toISOString()}
              className="font-semibold"
              title={`Published: ${blog.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            >
              {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </time>
            {blog.updatedAt > blog.createdAt && (
              <>
                <span>•</span>
                <time
                  dateTime={blog.updatedAt.toISOString()}
                  className="text-amber-700"
                  title={`Updated: ${blog.updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                >
                  Updated {new Date(blog.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </>
            )}
            <span>•</span>
            <span className="font-bold text-amber-900">⏱️ {blog.readingTimeMinutes} min read</span>
          </div>
        </header>

        {/* Big Hero Cover Image */}
        <div className="relative w-full h-[320px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl mb-12 border border-amber-900/15">
          <Image
            src={blog.coverImage || "/images/vibrant/hero.jpg"}
            alt={`${blog.title} — Makhana Gold Superfoods Journal cover image`}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            className="object-cover"
            title={blog.title}
          />
        </div>

        {/* 2-Column Article Layout: Left TOC + Right Content */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 lg:items-start mb-16">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:sticky lg:top-24">
            <TableOfContents content={blog.content} />
          </aside>

          {/* Right Column: Main Article Content */}
          <div className="min-w-0">
            <MarkdownRenderer content={blog.content} />
          </div>
        </div>

        {/* 🛍️ "Mentioned Superfoods" Direct Buy Bridge Widget */}
        <div className="my-14 p-8 bg-gradient-to-br from-[#FAF6EE] to-amber-50 rounded-3xl border border-amber-900/15 shadow-warm-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D84315] block mb-1">
                Harvest Store Direct
              </span>
              <h4 className="font-headline-sm text-xl font-extrabold text-amber-950">
                Mentioned In This Article
              </h4>
            </div>
            <Link
              href="/shop"
              title="Explore all Makhana Gold products"
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
        <div className="p-6 bg-white rounded-2xl border border-amber-900/10 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <span className="font-label-md text-xs uppercase tracking-widest text-amber-950 font-black">
            📢 Share this Wellness Guide:
          </span>

          <div className="flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on WhatsApp"
              aria-label="Share this article on WhatsApp"
              className="px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all"
            >
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X (Twitter)"
              aria-label="Share this article on X / Twitter"
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-125 transition-all"
            >
              <span>X (Twitter)</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on Facebook"
              aria-label="Share this article on Facebook"
              className="px-4 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all"
            >
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* ❓ FAQ Section — 3 FAQs per blog post with FAQPage Schema */}
        <div className="bg-[#FAF6EE] rounded-3xl border border-amber-900/10 overflow-hidden mb-12">
          <PageFAQ
            faqs={pageFaqs}
            title="Common Questions About This Topic"
            subtitle="Answers from our team of nutritionists and food scientists"
          />
        </div>

        {/* 💬 Blog Comments Section */}
        <BlogComments
          blogPostId={blog.id}
          comments={blog.comments.map((c) => ({
            id: c.id,
            authorName: c.authorName,
            body: c.body,
            createdAt: c.createdAt.toISOString(), // ← Date → string for client component
            replies: c.replies.map((r) => ({
              id: r.id,
              authorName: r.authorName,
              body: r.body,
              createdAt: r.createdAt.toISOString(), // ← Date → string
              replies: [],
            })),
          }))}
        />

        {/* Related Articles Strip */}
        {relatedBlogs.length > 0 && (
          <section className="pt-10 border-t border-amber-900/10 mt-10">
            <h4 className="font-headline-sm text-2xl font-black text-[#1C150C] mb-6">
              More From Superfoods Journal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  title={item.title}
                  className="bg-white p-5 rounded-2xl border border-amber-900/10 hover:border-amber-400 hover:shadow-lg transition-all group flex gap-4 items-center"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#FAF6EE]">
                    <Image
                      src={item.coverImage || "/images/vibrant/hero.jpg"}
                      alt={`${item.title} — Makhana Gold Blog`}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform"
                      title={item.title}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#D84315] block mb-1">{item.category}</span>
                    <h5 className="font-headline-sm text-sm font-bold text-on-surface group-hover:text-[#D84315] line-clamp-2 mb-1">
                      {item.title}
                    </h5>
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
