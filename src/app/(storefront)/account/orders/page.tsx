import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-primary-container/20 text-primary",
  processing: "bg-secondary-container/20 text-secondary",
  shipped: "bg-tertiary-container/30 text-tertiary",
  delivered: "bg-primary text-white",
  cancelled: "bg-error-container text-on-error-container",
  returned: "bg-error-container text-on-error-container",
};

export default async function MyOrdersPage() {
  const session = await auth();
  const customerId = Number(session!.user.id);

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline border-b border-outline-variant/20 pb-4">
        <div>
          <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-primary block mb-1">
            Order History
          </span>
          <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
            My Orders ({orders.length})
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs font-label-md text-primary hover:underline uppercase tracking-wider font-bold"
        >
          Explore Flavours
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 shadow-ambient">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">package_2</span>
          </div>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 max-w-sm mx-auto">
            Discover our artisanal fox nuts and experience the gold standard of healthy snacking.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#D84315] hover:bg-secondary text-white px-6 py-3 rounded-xl font-label-md text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 hover:border-primary-container/50 transition-all"
            >
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/15 pb-4 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-on-surface block">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Placed on{" "}
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`font-label-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    STATUS_BADGES[order.status] ?? "bg-surface-container text-on-surface"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-on-surface-variant">
                    <span>
                      {item.productName} ({item.variantName}) × {item.quantity}
                    </span>
                    <span className="font-semibold text-on-surface">₹{item.lineTotal.toString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/15">
                <div>
                  <span className="text-xs text-on-surface-variant block">Grand Total</span>
                  <span className="font-bold text-sm text-primary">₹{order.grandTotal.toString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/invoice/${order.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-label-md uppercase tracking-wider text-amber-950 border border-amber-900/20 bg-[#FAF6EE] px-3.5 py-2 rounded-xl hover:bg-amber-100 transition-colors font-bold inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-700">receipt_long</span>
                    <span>Invoice</span>
                  </a>
                  <Link
                    href={`/checkout/confirmed/${order.orderNumber}`}
                    className="text-xs font-label-md uppercase tracking-wider text-white bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 px-4 py-2 rounded-xl transition-all font-bold inline-flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                    <span>Track Order</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
