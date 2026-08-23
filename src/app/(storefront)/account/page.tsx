import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountDashboardPage() {
  const session = await auth();
  const customerId = Number(session!.user.id);

  const [orderCount, wishlistCount, recentOrder] = await Promise.all([
    prisma.order.count({ where: { customerId } }),
    prisma.wishlist.count({ where: { customerId } }),
    prisma.order.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { take: 1 } },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] || "Member";

  return (
    <div className="space-y-8">
      {/* Welcome Banner matching stitch */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-primary block mb-1">
            Account Overview
          </span>
          <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold">
            Namaste, {firstName}
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1">
            Welcome to your personal wellness pantry and order hub.
          </p>
        </div>

        <Link
          href="/shop"
          className="bg-[#D84315] hover:bg-secondary text-white px-6 py-3 rounded-xl font-label-md text-xs uppercase tracking-wider transition-colors shadow-xs shrink-0"
        >
          Shop Fresh Harvest
        </Link>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
          </div>
          <div>
            <p className="font-headline-sm text-2xl font-bold text-on-surface">
              {orderCount}
            </p>
            <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Total Orders
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">favorite</span>
          </div>
          <div>
            <p className="font-headline-sm text-2xl font-bold text-on-surface">
              {wishlistCount}
            </p>
            <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Wishlist Items
            </p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
          <div>
            <p className="font-headline-sm text-2xl font-bold text-primary">
              Tier 1
            </p>
            <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Gold Privilege
            </p>
          </div>
        </div>
      </section>

      {/* Recent Order Card matching stitch */}
      <section>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface">
            Most Recent Order
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-label-md uppercase tracking-wider text-primary hover:underline"
          >
            View All Orders
          </Link>
        </div>

        {recentOrder ? (
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/20 pb-4 mb-4">
              <div>
                <span className="font-mono text-xs text-on-surface-variant block">
                  Order #{recentOrder.orderNumber}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Placed on{" "}
                  {new Date(recentOrder.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="inline-block bg-primary-container/20 text-primary font-label-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {recentOrder.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden shrink-0 border border-outline-variant/20">
                  {recentOrder.items[0]?.variant.product.images[0] && (
                    <Image
                      src={recentOrder.items[0].variant.product.images[0].url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">
                    {recentOrder.items[0]?.productName}
                    {recentOrder.items.length > 1
                      ? ` + ${recentOrder.items.length - 1} more items`
                      : ""}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Grand Total: ₹{recentOrder.grandTotal.toString()}
                  </p>
                </div>
              </div>

              <Link
                href={`/checkout/confirmed/${recentOrder.orderNumber}`}
                className="text-xs font-label-md uppercase tracking-wider text-primary border border-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30 text-xs text-on-surface-variant">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/shop" className="text-primary font-bold hover:underline">
              Start shopping
            </Link>
            .
          </div>
        )}
      </section>

      {/* Quick Account Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/profile"
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 hover:border-primary-container transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                Personal Profile
              </h3>
              <p className="text-xs text-on-surface-variant">Update your name, phone number, and contact preferences.</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 hover:border-primary-container transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">home_pin</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                Delivery Addresses
              </h3>
              <p className="text-xs text-on-surface-variant">Manage multiple saved delivery locations for 1-click checkout.</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </Link>
      </section>
    </div>
  );
}
