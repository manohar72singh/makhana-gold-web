import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Pagination } from "@/components/storefront/Pagination";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Superfoods, Health & Nutrition Journal | Makhana Gold Blog",
  description:
    "Explore science-backed guides on Fox Nuts (Makhana) weight loss benefits, cold stone-ground Chana Sattu plant protein, and organic Red Rice Poha nutrition.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Makhana Gold Superfoods & Wellness Journal",
    description:
      "Expert nutritional guides, traditional Bihar culinary heritage, and healthy snacking lifestyle.",
    url: "https://makhanagold.com/blog",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
  },
};

const CATEGORIES = [
  "All Articles",
  "Health & Nutrition",
  "Superfood Recipes",
  "Fitness & Protein",
  "Harvest Stories",
];

export default async function BlogHubPage({
  searchParams,
}: PageProps<"/blog">) {
  const params = await searchParams;
  const activeCategory = typeof params.category === "string" ? params.category : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    isPublished: true,
    ...(activeCategory && activeCategory !== "All Articles" ? { category: activeCategory } : {}),
  };

  const [totalCount, featuredPost, allBlogs] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findFirst({
      where: { isPublished: true, featured: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
          </li>
          <li aria-current="page">
            <span className="text-primary font-semibold">Superfoods Journal</span>
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="font-label-md text-xs uppercase tracking-widest text-[#D84315] font-black block mb-3">
          Wellness • Food Science • Bihar Heritage
        </span>
        <h1 className="font-headline-lg text-3xl sm:text-5xl font-extrabold text-on-surface mb-4 tracking-tight">
          Superfoods &amp; Nutrition Journal
        </h1>
        <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
          Deep-dive into clinical health benefits, traditional recipes, and mindful snacking rituals crafted by food scientists and nutritionists.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex overflow-x-auto gap-2.5 pb-3 mb-10 no-scrollbar justify-start sm:justify-center">
        {CATEGORIES.map((cat) => {
          const isSelected = (!activeCategory && cat === "All Articles") || activeCategory === cat;
          const href = cat === "All Articles" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;

          return (
            <Link
              key={cat}
              href={href}
              className={`px-5 py-2 rounded-full text-xs font-label-md shrink-0 transition-all font-bold ${
                isSelected
                  ? "bg-[#D84315] text-white shadow-warm-1"
                  : "bg-[#FAF6EE] text-amber-950 hover:bg-amber-100/80 border border-amber-900/10"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* ⭐ Spotlight Featured Post (Only on Page 1 without category filter) */}
      {!activeCategory && page === 1 && featuredPost && (
        <div className="mb-14 bg-gradient-to-br from-[#2B1B04] to-[#1C150C] rounded-3xl overflow-hidden text-white shadow-2xl border border-amber-500/20 grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[300px] lg:min-h-full">
            <Image
              src={featuredPost.coverImage || "/images/vibrant/hero.jpg"}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute top-4 left-4 bg-gradient-to-r from-[#E64A19] to-[#D84315] text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              ⭐ Editor&apos;s Pick
            </div>
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-amber-300 text-xs font-bold mb-3">
                <span>{featuredPost.category}</span>
                <span>•</span>
                <span>⏱️ {featuredPost.readingTimeMinutes} min read</span>
              </div>

              <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
                <Link href={`/blog/${featuredPost.slug}`} className="hover:text-amber-300 transition-colors">
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="font-body-md text-amber-100/80 text-sm leading-relaxed mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 overflow-hidden relative">
                  <Image
                    src={featuredPost.authorAvatar || "/images/logo/logo.png"}
                    alt={featuredPost.authorName}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{featuredPost.authorName}</p>
                  <p className="text-[10px] text-amber-300/80">{featuredPost.authorRole}</p>
                </div>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="bg-white text-amber-950 hover:bg-amber-300 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Read Story</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 📚 Articles Grid */}
      {allBlogs.length === 0 ? (
        <div className="p-16 text-center bg-[#FAF6EE] rounded-3xl border border-amber-900/10">
          <p className="font-headline-sm text-lg font-bold text-amber-950 mb-2">
            No articles found in this category.
          </p>
          <Link href="/blog" className="text-xs text-[#D84315] font-bold hover:underline">
            View All Articles →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allBlogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-3xl overflow-hidden border border-amber-900/10 hover:border-amber-400/60 shadow-warm-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Photo */}
                  <Link href={`/blog/${blog.slug}`} className="block relative h-52 overflow-hidden bg-[#FAF6EE]">
                    <Image
                      src={blog.coverImage || "/images/vibrant/hero.jpg"}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#FAF6EE]/90 backdrop-blur-xs text-amber-950 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-amber-900/10">
                      {blog.category}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant font-semibold mb-2">
                      <span>⏱️ {blog.readingTimeMinutes} min read</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>

                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-[#D84315] transition-colors mb-3 leading-snug">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>

                    <p className="font-body-md text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Author & Action */}
                <div className="px-6 pb-6 pt-3 border-t border-amber-900/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-amber-900/10 overflow-hidden relative">
                      <Image
                        src={blog.authorAvatar || "/images/logo/logo.png"}
                        alt={blog.authorName}
                        fill
                        sizes="32px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-on-surface">{blog.authorName}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-xs font-bold text-[#D84315] hover:underline flex items-center gap-1"
                  >
                    <span>Read</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </main>
  );
}
