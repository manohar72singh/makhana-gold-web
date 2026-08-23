import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGridCard } from "@/components/storefront/ProductGridCard";

export default async function WishlistPage() {
  const session = await auth();
  const customerId = Number(session!.user.id);

  const items = await prisma.wishlist.findMany({
    where: { customerId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          attributes: true,
          category: true,
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-lg">
      <h1 className="font-headline-xl text-headline-xl text-on-surface mb-lg">My Wishlist</h1>

      {items.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Your wishlist is empty. Browse the shop and tap the heart icon to save items.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl">
          {items.map((item) => (
            <ProductGridCard
              key={item.id}
              product={{ ...item.product, variants: [item.variant] }}
              isWishlisted
              showWishlist
            />
          ))}
        </div>
      )}
    </div>
  );
}
