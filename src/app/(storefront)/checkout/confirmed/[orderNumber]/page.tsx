import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrderTrackingTimeline } from "@/lib/logistics";
import { OrderTrackingTimeline } from "@/components/storefront/OrderTrackingTimeline";
import { PurchaseTrackerClient } from "@/components/storefront/PurchaseTrackerClient";

async function getOrder(orderNumber: string, customerId: number) {
  return prisma.order.findFirst({
    where: { orderNumber, customerId },
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
  });
}

export default async function OrderConfirmedPage({
  params,
}: PageProps<"/checkout/confirmed/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) notFound();

  const order = await getOrder(orderNumber, customerId);
  if (!order) notFound();

  const trackingSteps = getOrderTrackingTimeline({
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    trackingNumber: order.trackingNumber,
    courierPartner: order.courierPartner,
  });

  return (
    <main className="pt-10 pb-huge min-h-screen">
      <PurchaseTrackerClient
        orderNumber={order.orderNumber}
        grandTotal={Number(order.grandTotal)}
        itemCount={order.items.reduce((s, i) => s + i.quantity, 0)}
      />
      <div className="max-w-4xl mx-auto px-gutter">
        {/* Celebration Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-fixed/80 rounded-full mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[42px] text-primary">
              check_circle
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl md:text-4xl text-primary font-bold mb-2">
            Order Confirmed!
          </h1>
          <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            Your artisanal fox nuts are being freshly packed. We&apos;ve sent your order confirmation and dispatch updates to your registered account.
          </p>
        </div>

        {/* Live Tracking Timeline Stepper */}
        <div className="mb-8">
          <OrderTrackingTimeline
            steps={trackingSteps}
            trackingNumber={order.trackingNumber}
            courierPartner={order.courierPartner}
            trackingUrl={order.trackingUrl}
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Order Details & Summary */}
          <div className="md:col-span-7 space-y-6">
            <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
              <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4 mb-6">
                <div>
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                    Order Details
                  </h2>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    Order #{order.orderNumber}
                  </p>
                </div>
                <span className="inline-block bg-primary-container/20 text-primary font-label-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {order.status}
                </span>
              </div>

              {/* Payment Status & Details Badge */}
              <div className="mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs bg-[#FAF6EE] border-amber-900/15">
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-xl ${
                    order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-700"
                  }`}>
                    {order.paymentStatus === "paid" ? "verified" : "pending_actions"}
                  </span>
                  <div>
                    <span className="font-bold text-on-surface block">
                      {order.paymentStatus === "paid"
                        ? "Payment Verified (Paid Online)"
                        : "Payment Method: Pay on Delivery (COD)"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {order.paymentReference
                        ? `Razorpay Txn: ${order.paymentReference}`
                        : "Pay in cash or via UPI scan upon delivery"}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}>
                  {order.paymentStatus === "paid" ? "PAID" : "PENDING"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                <div>
                  <p className="text-on-surface-variant uppercase font-semibold mb-1">
                    Date Placed
                  </p>
                  <p className="text-on-surface font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant uppercase font-semibold mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-primary font-bold">
                    3-5 Business Days
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/20 mb-6">
                <h3 className="font-bold text-xs uppercase tracking-wider text-primary mb-2">
                  Items In This Harvest
                </h3>
                {order.items.map((item) => {
                  const image = item.variant.product.images[0];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-2 border-b border-outline-variant/15 last:border-0"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/20">
                        {image && (
                          <Image
                            src={image.url}
                            alt={image.altText ?? item.productName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="grow min-w-0">
                        <h4 className="font-bold text-xs text-on-surface truncate">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          Qty: {item.quantity} • {item.variantName}
                        </p>
                      </div>
                      <div className="font-bold text-xs text-on-surface text-right">
                        ₹{item.lineTotal.toString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-on-surface font-semibold">₹{order.subtotal.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={Number(order.shippingTotal) === 0 ? "text-primary font-bold" : "text-on-surface"}>
                    {Number(order.shippingTotal) === 0 ? "FREE" : `₹${order.shippingTotal}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-on-surface pt-2 border-t border-outline-variant/20">
                  <span>Grand Total</span>
                  <span className="text-primary text-base">₹{order.grandTotal.toString()}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-outline-variant/20">
                <Link
                  href="/account/orders"
                  className="flex-1 bg-[#D84315] hover:bg-secondary text-white font-label-md text-xs uppercase tracking-wider py-3 px-4 rounded-xl text-center transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 font-bold"
                >
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  Track Your Order
                </Link>
                <a
                  href={`/api/invoice/${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#FAF6EE] hover:bg-amber-100/80 border border-amber-900/20 text-amber-950 font-label-md text-xs uppercase tracking-wider py-3 px-4 rounded-xl text-center transition-colors inline-flex items-center justify-center gap-1.5 font-bold"
                >
                  <span className="material-symbols-outlined text-sm text-amber-700">receipt_long</span>
                  Download GST Invoice
                </a>
              </div>
            </section>
          </div>

          {/* Right 5 Columns: Referral & Founder Note */}
          <div className="md:col-span-5 space-y-6">
            {/* Share the Gold Card */}
            <section className="bg-surface-container-low border border-outline-variant/40 rounded-3xl p-6 text-center shadow-xs">
              <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary-container/20 text-primary mb-3">
                <span className="material-symbols-outlined text-2xl">redeem</span>
              </div>
              <h3 className="font-headline-sm text-base font-bold text-primary mb-1">
                Share The Gold
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed">
                Give your friends 15% off their first order with code <span className="font-bold text-primary">GOLDEN15</span>.
              </p>
              <div className="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-2 text-xs text-on-surface-variant font-mono">
                <span className="truncate flex-1 pl-2">makhanagold.com?ref={order.orderNumber}</span>
                <span className="material-symbols-outlined text-sm text-primary pr-1">content_copy</span>
              </div>
            </section>

            {/* Founder Note */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 text-center">
              <div className="w-12 h-0.5 bg-primary-container mx-auto mb-3" />
              <p className="font-body-md text-xs italic text-on-surface-variant leading-relaxed">
                &ldquo;Thank you for choosing Makhana Gold. We carefully source and slow-roast every batch to ensure you experience the perfect harmony of artisanal heritage and modern, nourishing health.&rdquo;
              </p>
              <p className="mt-3 font-headline-sm text-xs font-bold text-primary">
                — The Artisanal Roasting Team
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
