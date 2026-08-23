import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";

const CATEGORY_HERO: Record<string, { image: string; tagline: string }> = {
  "flavoured-makhana": {
    image: "/images/flavoured_makhana_category_detail/img-23da269e-23da269e.jpg",
    tagline:
      "Discover the perfect harmony of ancient superfoods and modern culinary artistry. Our flavoured makhana is slow-roasted to a delicate crunch, delivering a guilt-free indulgence that honors tradition.",
  },
  "roasted-makhana": {
    image:
      "/images/makhana_gold_homepage/a-macro-editorial-style-photograph-of-perfectly-roasted-whit-46b14059.jpg",
    tagline:
      "Pure, hand-picked fox nuts roasted to a light, airy crunch — nature's simplest, purest snack.",
  },
};

export default async function CategoryDetailPage({
  params,
}: PageProps<"/shop/[category]">) {
  const { category: slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const [products, wishlist] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active", categoryId: category.id },
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
      orderBy: { createdAt: "asc" },
    }),
    customerId
      ? prisma.wishlist.findMany({ where: { customerId }, select: { variantId: true } })
      : Promise.resolve([]),
  ]);
  const wishlistedIds = new Set(wishlist.map((w) => w.variantId));

  const hero = CATEGORY_HERO[slug];

  return (
    <main className="max-w-container-max mx-auto px-md md:px-lg pt-xl md:pt-xxl pb-huge">
      <nav aria-label="Breadcrumb" className="mb-lg">
        <ol className="flex items-center space-x-sm font-label-sm text-label-sm text-on-surface-variant">
          <li>
            <Link href="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li aria-current="page" className="text-secondary">
            {category.name}
          </li>
        </ol>
      </nav>

      {hero && (
        <section className="mb-huge relative w-full h-[50vh] min-h-[320px] flex items-center justify-center rounded-xl overflow-hidden shadow-warm-2">
          <Image src={hero.image} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center max-w-3xl px-md">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-secondary mb-md drop-shadow-md">
              {category.name}
            </h1>
            <p className="font-body-lg text-body-lg text-on-secondary drop-shadow-sm">
              {hero.tagline}
            </p>
          </div>
        </section>
      )}

      <div className="flex justify-between items-center mb-xl">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Showing {products.length} product{products.length === 1 ? "" : "s"}
        </span>
        <Link href="/shop" className="font-label-md text-label-md text-primary hover:text-secondary transition-colors">
          View All Products
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl">
          {products.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.variants[0]?.id)}
              showWishlist
            />
          ))}
        </div>
      )}
    </main>
  );
}
