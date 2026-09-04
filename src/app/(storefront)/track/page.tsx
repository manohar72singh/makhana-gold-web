import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/content";
import { getOrderTrackingTimeline } from "@/lib/logistics";
import { OrderTrackingTimeline } from "@/components/storefront/OrderTrackingTimeline";

export const metadata: Metadata = {
  title: "Track Your Order | Makhana Gold Live Shipment Tracking",
  description:
    "Live track your artisanal roasted Makhana shipment. Real-time updates with Delhivery, Shiprocket, and Blue Dart courier AWB tracking.",
  alternates: {
    canonical: "/track",
  },
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params?.order === "string" ? params.order.trim() : typeof params?.q === "string" ? params.q.trim() : "";
  const settings = await getSiteSettings();
  const supportPhone = settings["support_phone"] || "+91 60016 84216";
  const whatsappNumber = settings["support_whatsapp"] || "916001684216";

  let order = null;
  let searched = false;

  if (query) {
    searched = true;
    const cleanPhone = query.replace(/[^0-9]/g, "");

    // Search by Order Number (e.g. MG-8001 or 8001) or by customer Phone
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query } },
          { orderNumber: { equals: `MG-${query}` } },
          cleanPhone.length >= 10
            ? {
                customer: {
                  phone: { contains: cleanPhone.slice(-10) },
                },
              }
            : { id: -1 },
        ],
      },
      include: {
        customer: true,
        shippingAddress: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1 },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const trackingSteps = order
    ? getOrderTrackingTimeline({
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber,
        courierPartner: order.courierPartner,
      })
    : [];

  const courierUrl =
    order?.courierPartner?.toLowerCase().includes("delhivery")
      ? `https://www.delhivery.com/track/package/${order.trackingNumber}`
      : order?.courierPartner?.toLowerCase().includes("shiprocket")
      ? `https://shiprocket.co/tracking/${order.trackingNumber}`
      : order?.trackingNumber
      ? `https://trackcourier.in/track/${order.trackingNumber}`
      : null;

  return (
    <main className="min-h-screen py-10 sm:py-16 px-5 sm:px-gutter bg-[#FAF6EE]/50">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px] text-[#D84315]">local_shipping</span>
            Pan-India Live Logistics
          </span>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-bold text-on-surface">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Enter your <strong>Order Number (e.g. MG-8001)</strong> or registered <strong>Phone Number</strong> to check live dispatch status.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-900/10 shadow-warm-1">
          <form method="GET" action="/track" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xl">
                search
              </span>
              <input
                type="text"
                name="order"
                defaultValue={query}
                required
                placeholder="Enter Order # (e.g. MG-8001) or 10-digit Phone..."
                className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Track Shipment</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && !order && (
          <div className="bg-white p-8 rounded-3xl border border-red-200 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">package_2</span>
            </div>
            <h3 className="font-bold text-base text-neutral-800">Order Not Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find an active order matching <strong>&ldquo;{query}&rdquo;</strong>. Please check your order number in your SMS / Email confirmation or WhatsApp our concierge.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Namaste! I need help tracking my order (${query}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider"
              >
                <span>WhatsApp Helpline</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-3xl border border-amber-900/10 shadow-warm-1 overflow-hidden animate-in fade-in duration-300">
            {/* Top Order Overview Banner */}
            <div className="p-6 sm:p-8 bg-[#1C150C] text-[#F9F5ED] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  Makhana Gold Verified Shipment
                </span>
                <h2 className="font-headline-md text-2xl font-bold text-white">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-xs text-amber-100/70 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })} • {order.items.reduce((s, i) => s + i.quantity, 0)} Items
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 border border-amber-400 text-amber-300">
                  Status: {order.status}
                </span>
                <div className="text-xs text-amber-200/80 mt-1 font-semibold">
                  Amount: ₹{Number(order.grandTotal).toFixed(0)} ({order.paymentStatus === "paid" ? "PREPAID" : "COD"})
                </div>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="p-6 sm:p-8 border-b border-amber-900/10">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-6">
                Fulfillment &amp; Courier Journey
              </h3>
              <OrderTrackingTimeline steps={trackingSteps} />
            </div>

            {/* Courier Details & Live AWB */}
            {order.trackingNumber && (
              <div className="p-6 sm:p-8 bg-[#FAF6EE] border-b border-amber-900/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#D84315] uppercase tracking-widest block">
                    Logistics Partner Handover
                  </span>
                  <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-700 text-base">local_shipping</span>
                    <span>{order.courierPartner || "Delhivery Express"}</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    AWB Tracking #: <strong className="font-mono text-neutral-900">{order.trackingNumber}</strong>
                  </p>
                </div>

                {courierUrl && (
                  <a
                    href={courierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-[#D84315] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    <span>Carrier Tracking Portal</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
              </div>
            )}

            {/* Order Items List */}
            <div className="p-6 sm:p-8">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-4">
                Package Contents
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const image = item.variant?.product?.images?.[0];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6EE]/50 border border-amber-900/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-amber-900/10">
                          {image && (
                            <Image
                              src={image.url}
                              alt={image.altText || item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-neutral-900">{item.productName}</h4>
                          <p className="text-[11px] text-neutral-500">
                            {item.variantName} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-neutral-900">
                        ₹{Number(item.lineTotal).toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Address & Helpline footer */}
              <div className="mt-6 pt-6 border-t border-amber-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-neutral-600">
                <div>
                  {/* Order numbers are sequential and guessable, and this
                      page needs no login — so full name/pincode (which
                      would let anyone scrape customer PII by walking
                      through order numbers) are intentionally not shown
                      here, only enough to sanity-check it's your order. */}
                  <strong>Delivering to:</strong> {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/invoice/${order.orderNumber}`}
                    target="_blank"
                    className="text-[#D84315] font-bold hover:underline"
                  >
                    Download Tax Invoice ↗
                  </a>
                  <span>•</span>
                  <a href={`tel:${supportPhone}`} className="hover:underline">
                    Help: {supportPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
