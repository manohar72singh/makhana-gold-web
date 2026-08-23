import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STEPS = ["confirmed", "processing", "shipped", "delivered"] as const;

export default async function OrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await auth();
  const customerId = Number(session!.user.id);

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
    include: {
      items: { include: { variant: { include: { product: { include: { images: { take: 1 } } } } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      shippingAddress: true,
    },
  });
  if (!order) notFound();

  const currentStepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const isCancelled = order.status === "cancelled" || order.status === "returned";

  return (
    <div className="py-lg max-w-4xl">
      <Link href="/account/orders" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors mb-md inline-block">
        ← Back to Orders
      </Link>
      <div className="flex justify-between items-start mb-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Order #{order.orderNumber}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary px-md py-xs rounded-full capitalize">
          {order.status}
        </span>
      </div>

      {!isCancelled && (
        <div className="bg-surface-container-lowest rounded-xl p-xl shadow-warm-1 border border-outline-variant/30 mb-xl">
          <div className="flex items-center justify-between relative">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-xs flex-1 relative">
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-4 h-px w-full -z-10 ${i <= currentStepIndex ? "bg-primary" : "bg-outline-variant"}`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md ${
                    i <= currentStepIndex
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`font-label-sm text-label-sm capitalize ${i <= currentStepIndex ? "text-primary font-bold" : "text-on-surface-variant"}`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-xl shadow-warm-1 border border-outline-variant/30 mb-xl">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Items</h2>
        <div className="space-y-md">
          {order.items.map((item) => {
            const image = item.variant.product.images[0];
            return (
              <div key={item.id} className="flex items-center gap-md py-sm border-b border-outline-variant/20 last:border-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low shrink-0">
                  {image && (
                    <Image src={image.url} alt={image.altText ?? item.productName} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="grow">
                  <p className="font-body-md text-body-md text-on-surface">{item.productName}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Qty {item.quantity} • {item.variantName}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <span className="font-body-md text-body-md text-on-surface">₹{item.lineTotal.toString()}</span>
                  {order.status === "delivered" && (
                    <Link
                      href={`/account/orders/${order.orderNumber}/return?item=${item.id}`}
                      className="font-label-sm text-label-sm text-secondary hover:underline"
                    >
                      Return
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-lg pt-md border-t border-outline-variant/30 flex justify-between font-headline-sm text-headline-sm text-on-surface">
          <span>Total</span>
          <span>₹{order.grandTotal.toString()}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-surface-container-lowest rounded-xl p-xl shadow-warm-1 border border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Shipping Address</h2>
          <p className="font-body-md text-body-md text-on-surface">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
          </p>
        </div>
      )}
    </div>
  );
}
