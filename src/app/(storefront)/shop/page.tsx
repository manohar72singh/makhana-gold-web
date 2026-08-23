import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryFilter, SortSelect } from "@/components/storefront/ShopFilters";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { Pagination } from "@/components/storefront/Pagination";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Shop All Artisanal Roasted Fox Nuts, Sattu & Organic Poha",
  description:
    "Explore our complete range of slow-roasted Makhana, stone-ground Bihari Chana Sattu, and whole-grain organic Poha. Free shipping available across India.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Artisanal Superfoods Collection | Makhana Gold",
    description:
      "Hand-selected, slow dry-roasted Bihar wetland lotus seeds, stone-ground Sattu, and organic Poha.",
    url: "https://makhanagold.com/shop",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
  },
};

async function getCategoryTree() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

async function getPaginatedProducts(
  categorySlug: string | undefined,
  sort: string | undefined,
  page: number
) {
  const orderBy =
    sort === "newest"
      ? ({ createdAt: "desc" } as const)
      : ({ createdAt: "asc" } as const);

  let categoryCondition: any = {};

  if (categorySlug) {
    const selectedCat = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { children: true },
    });

    if (selectedCat) {
      if (selectedCat.children.length > 0) {
        const catIds = [selectedCat.id, ...selectedCat.children.map((c) => c.id)];
        categoryCondition = { categoryId: { in: catIds } };
      } else {
        categoryCondition = { categoryId: selectedCat.id };
      }
    }
  }

  const where = {
    status: "active" as const,
    ...categoryCondition,
  };

  const [totalCount, allMatchingProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: {
          orderBy: { price: "asc" },
          take: 1,
          include: { inventoryStock: true },
        },
        category: true,
        attributes: true,
      },
      orderBy,
    }),
  ]);

  if (sort === "price_asc") {
    allMatchingProducts.sort((a, b) => Number(a.variants[0]?.price ?? 0) - Number(b.variants[0]?.price ?? 0));
  } else if (sort === "price_desc") {
    allMatchingProducts.sort((a, b) => Number(b.variants[0]?.price ?? 0) - Number(a.variants[0]?.price ?? 0));
  }

  const skip = (page - 1) * PAGE_SIZE;
  const paginatedProducts = allMatchingProducts.slice(skip, skip + PAGE_SIZE);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    products: paginatedProducts,
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export default async function ShopAllPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const [categoriesTree, { products, totalCount, totalPages, currentPage }, wishlist] =
    await Promise.all([
      getCategoryTree(),
      getPaginatedProducts(categorySlug, sort, page),
      customerId
        ? prisma.wishlist.findMany({ where: { customerId }, select: { variantId: true } })
        : Promise.resolve([]),
    ]);

  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-6 sm:mb-8">
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
            <span className="text-primary font-semibold">Shop Collection</span>
          </li>
        </ol>
      </nav>

      {/* Hero Heading */}
      <div className="max-w-3xl mb-8 sm:mb-12">
        <span className="font-label-md text-xs uppercase tracking-widest text-[#D84315] font-black block mb-2">
          Pure • Traditional • Nutrient-Dense
        </span>
        <h1 className="font-headline-lg text-3xl sm:text-4xl font-extrabold text-on-surface mb-3 tracking-tight">
          Artisanal Superfoods Harvest
        </h1>
        <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
          Explore our generational harvests from Bihar: hand-graded roasted Fox Nuts (Makhana), cold stone-ground pure Chana Sattu, and whole-grain organic Poha.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Hierarchical Category Sidebar & Top Filter */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-[100px]">
          <CategoryFilter categoryTree={categoriesTree} />
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-4 border-b border-amber-900/10">
            <span className="font-body-md text-xs sm:text-sm text-on-surface-variant font-semibold">
              Showing <span className="text-on-surface font-bold">{totalCount}</span> Harvest Product{totalCount === 1 ? "" : "s"}
            </span>
            <SortSelect />
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF6EE] rounded-3xl border border-amber-900/10">
              <p className="font-headline-sm text-lg font-bold text-on-surface mb-1">
                No products found in this category.
              </p>
              <p className="font-body-md text-xs text-on-surface-variant">
                Try selecting &quot;All Superfoods&quot; or another category filter.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {products.map((product) => (
                  <ProductGridCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistedIds.has(product.variants[0]?.id)}
                    showWishlist
                  />
                ))}
              </div>

              {/* 📄 STOREFRONT PAGINATION */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={PAGE_SIZE}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
