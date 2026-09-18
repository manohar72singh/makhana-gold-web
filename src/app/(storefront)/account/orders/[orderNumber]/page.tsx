import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCarrierTrackingUrl } from "@/lib/logistics";
import { ReorderButtonClient } from "../ReorderButtonClient";
import { CancelOrderButtonClient } from "./CancelOrderButtonClient";

const STEPS = ["confirmed", "processing", "shipped", "delivered"] as const;

export default async function OrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;
  if (!customerId) notFound();

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
  const canCancel = order.status === "pending" || order.status === "confirmed";

  const cleanWhatsapp = "916001684216";
  const damageReportUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Namaste Makhana Gold! My order #${order.orderNumber} arrived with damaged courier packaging. Here are the unboxing photos for a quick replacement.`
  )}`;

  return (
    <div className="py-lg max-w-4xl space-y-6">
      <Link
        href="/account/orders"
        className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors inline-block"
      >
        ← Back to Orders
      </Link>

      {/* Header Banner */}
      <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Order #{order.orderNumber}</h1>
            {order.isB2b && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">corporate_fare</span>
                B2B Business Order
              </span>
            )}
            <span
              className={`font-label-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-primary-container/20 text-primary border border-primary/20"
              }`}
            >
              {order.status}
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {order.isB2b && order.companyName && (
            <div className="mt-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
              <span className="font-bold">Billed To:</span> {order.companyName}{" "}
              {order.gstin && (
                <span className="ml-2 font-mono font-bold text-emerald-800">
                  (GSTIN: {order.gstin})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <ReorderButtonClient orderId={order.id} variant="button" />

          <a
            href={`/api/invoice/${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#FAF6EE] hover:bg-amber-100 text-amber-950 border border-amber-900/20 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#D84315]">receipt_long</span>
            <span>Download GST Invoice ↗</span>
          </a>

          {canCancel && (
            <CancelOrderButtonClient orderNumber={order.orderNumber} />
          )}
        </div>
      </div>

      {/* Live Order Tracking Stepper */}
      {!isCancelled ? (
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/15 pb-3">
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                <span>Delivery &amp; Courier Tracking</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Dispatched with express ambient temperature courier for maximum crispness.
              </p>
            </div>

            {order.trackingNumber && (
              <div className="text-right">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">AWB Tracking ID</span>
                <span className="font-mono text-xs font-bold text-primary">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="flex items-center justify-between relative py-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-4 h-0.5 w-full -z-10 ${
                      i <= currentStepIndex ? "bg-primary" : "bg-outline-variant/40"
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-xs font-bold transition-all ${
                    i <= currentStepIndex
                      ? "bg-primary text-on-primary shadow-xs ring-4 ring-primary/10"
                      : "bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`font-label-sm text-[11px] capitalize text-center ${
                    i <= currentStepIndex ? "text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  {step === "confirmed"
                    ? "Confirmed"
                    : step === "processing"
                    ? "Packed & Checked"
                    : step === "shipped"
                    ? "Dispatched"
                    : "Delivered"}
                </span>
              </div>
            ))}
          </div>

          {/* Courier Details Card if Shipped */}
          {order.trackingNumber && (
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[#D84315]">alt_route</span>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                    Courier Partner: {order.courierPartner || "Express Courier"}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    Airway Bill (AWB): {order.trackingNumber}
                  </span>
                </div>
              </div>
              {order.trackingNumber && (
                <a
                  href={order.trackingUrl || getCarrierTrackingUrl(order.courierPartner || "Delhivery", order.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-label-md text-xs uppercase font-bold tracking-wider inline-flex items-center gap-1.5 shadow-xs hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>Track on Courier Portal</span>
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50/70 rounded-3xl p-6 border border-red-200 flex items-center gap-3 text-red-800 text-xs">
          <span className="material-symbols-outlined text-2xl text-red-600">cancel</span>
          <div>
            <span className="font-bold block">Order Cancelled</span>
            <span>This order was cancelled prior to dispatch. Any prepaid amount will be refunded to your original source.</span>
          </div>
        </div>
      )}

      {/* Items Section */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
        <h2 className="font-headline-sm text-base font-bold text-on-surface mb-4 border-b border-outline-variant/15 pb-3">
          Ordered Flavours &amp; Pack Sizes ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            const image = item.variant.product.images[0];
            return (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b border-outline-variant/15 last:border-0">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/20">
                  {image && (
                    <Image src={image.url} alt={image.altText ?? item.productName} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="grow min-w-0">
                  <p className="font-bold text-xs text-on-surface truncate">{item.productName}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Qty {item.quantity} • Pack: {item.variantName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-on-surface">₹{Number(item.lineTotal).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Price & Tax Breakdown */}
        <div className="mt-6 pt-4 border-t border-outline-variant/30 space-y-2 text-xs text-on-surface-variant">
          <div className="flex justify-between">
            <span>Subtotal (Gross)</span>
            <span className="font-semibold text-on-surface">₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discounts Applied</span>
              <span>-₹{Number(order.discountTotal).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST (5% Included • HSN: 19041090)</span>
            <span className="font-semibold text-on-surface">₹{Number(order.taxTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping &amp; Handling</span>
            <span className="font-semibold text-on-surface">
              {Number(order.shippingTotal) === 0 ? "FREE" : `₹${Number(order.shippingTotal).toFixed(2)}`}
            </span>
          </div>
          <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
            <span className="font-bold text-sm text-on-surface">Grand Total</span>
            <span className="text-[#D84315] font-black text-lg">₹{Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address & Food Safety Notice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">home_pin</span>
              <span>Shipping Address</span>
            </h3>
            <p className="text-xs font-semibold text-on-surface">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {order.shippingAddress.city}, {order.shippingAddress.state} — <strong>{order.shippingAddress.pincode}</strong>
            </p>
          </div>
        )}

        {/* FSSAI Food Safety & Non-Returnable Notice */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
              <span>FSSAI Hygiene Compliance</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Consumable superfood items are strictly <strong>non-returnable</strong> under FSSAI food hygiene protocols once dispatched to prevent contamination and safeguard public health.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <a
              href={damageReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#D84315] hover:underline inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#25D366]">chat</span>
              <span>Report Transit Damage for Instant Replacement ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
