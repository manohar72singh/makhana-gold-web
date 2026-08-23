import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";
import { Pagination } from "@/components/storefront/Pagination";

const PAGE_SIZE = 6;

const POPULAR_SEARCHES = [
  "Pink Salt",
  "Chana Sattu",
  "Red Rice Poha",
  "Truffle",
  "Litti Special",
  "Poha Chivda",
];

async function searchProducts(q: string, page: number) {
  if (!q.trim()) return { products: [], totalCount: 0, totalPages: 0 };

  const where = {
    status: "active" as const,
    OR: [
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { name: { contains: q } } },
    ],
  };

  const [totalCount, allProducts] = await Promise.all([
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
        attributes: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const skip = (page - 1) * PAGE_SIZE;
  const paginatedProducts = allProducts.slice(skip, skip + PAGE_SIZE);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    products: paginatedProducts,
    totalCount,
    totalPages,
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const [{ products, totalCount, totalPages }, wishlist] = await Promise.all([
    searchProducts(q, page),
    customerId
      ? prisma.wishlist.findMany({ where: { customerId }, select: { variantId: true } })
      : Promise.resolve([]),
  ]);
  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-10 sm:py-16">
      <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
        <h1 className="font-headline-lg text-2xl md:text-3xl text-primary font-bold text-center mb-6">
          Search The Harvest Collection
        </h1>

        {/* Search Input Bar */}
        <form className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-2xl">
            search
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search Makhana, Sattu, Poha, Flavours..."
            autoFocus
            className="w-full pl-14 pr-24 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-ambient focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-sm text-on-surface"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#D84315] hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-label-md text-xs uppercase tracking-wider transition-colors cursor-pointer font-bold"
          >
            Search
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-on-surface-variant font-semibold">Popular Searches:</span>
          {POPULAR_SEARCHES.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="bg-surface-container-low hover:bg-primary-container/20 text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-full border border-outline-variant/30 transition-colors font-medium"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {q && (
        <div className="mb-8 border-b border-outline-variant/20 pb-4 flex justify-between items-baseline">
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-on-surface">
              Results for &ldquo;{q}&rdquo;
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Found {totalCount} product{totalCount === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs text-primary font-label-md uppercase tracking-wider hover:underline font-bold"
          >
            Browse All Collection →
          </Link>
        </div>
      )}

      {/* Empty State */}
      {q && products.length === 0 && (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 shadow-ambient max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
            No Exact Matches Found
          </h3>
          <p className="text-xs text-on-surface-variant mb-6">
            We couldn&apos;t find any items matching &ldquo;{q}&rdquo;. Try checking the spelling or browse our collection.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#D84315] hover:bg-secondary text-white px-6 py-3 rounded-xl font-label-md text-xs uppercase tracking-wider transition-colors shadow-sm font-bold"
          >
            Explore All Superfoods
          </Link>
        </div>
      )}

      {/* Results Grid */}
      {products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedIds.has(product.variants[0]?.id)}
                showWishlist
              />
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
