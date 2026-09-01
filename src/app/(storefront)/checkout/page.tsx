import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCartWithItems } from "@/lib/cart";
import { placeOrderAction } from "./actions";
import { CheckoutAddressSelector } from "./CheckoutAddressSelector";
import { CheckoutPaymentClient } from "./CheckoutPaymentClient";

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, cart, session] = await Promise.all([
    searchParams,
    getCartWithItems(),
    auth(),
  ]);

  if (cart.items.length === 0) redirect("/cart");

  const customerId = session?.user?.id ? Number(session.user.id) : null;
  const [savedAddresses, customer] = customerId
    ? await Promise.all([
        prisma.address.findMany({
          where: { customerId },
          orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
        }),
        prisma.customer.findUnique({
          where: { id: customerId },
          select: { name: true, phone: true },
        }),
      ])
    : [[], null];

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
    0
  );

  const couponCode = typeof params?.coupon === "string" ? params.coupon.toUpperCase().trim() : undefined;
  let appliedCoupon: {
    id: number;
    code: string;
    discount: number;
    type: string;
    value: number;
  } | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    if (coupon && coupon.isActive && (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue))) {
      const discount =
        coupon.type === "percent"
          ? (subtotal * Number(coupon.value)) / 100
          : Math.min(Number(coupon.value), subtotal);
      appliedCoupon = {
        id: coupon.id,
        code: coupon.code,
        discount: Math.round(discount * 100) / 100,
        type: coupon.type,
        value: Number(coupon.value),
      };
    }
  }

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const isFreeShipCoupon = couponCode === "FREESHIP";
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShipCoupon ? 0 : SHIPPING_FEE;
  const tax = discountedSubtotal * TAX_RATE;
  const grandTotal = discountedSubtotal + shipping + tax;

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-6 sm:py-10 md:py-16">
      {/* 4-Step Progress Stepper matching stitch mockup */}
      <div className="max-w-xl mx-auto mb-8 sm:mb-12">
        <div className="flex items-center justify-between relative z-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </div>
            <span className="font-label-sm text-xs text-primary font-bold hidden sm:block">Address</span>
          </div>

          <div className="flex-1 h-0.5 bg-outline-variant/50 mx-2" />

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-semibold text-xs">
              2
            </div>
            <span className="font-label-sm text-xs text-on-surface-variant hidden sm:block">Delivery</span>
          </div>

          <div className="flex-1 h-0.5 bg-outline-variant/50 mx-2" />

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-semibold text-xs">
              3
            </div>
            <span className="font-label-sm text-xs text-on-surface-variant hidden sm:block">Payment</span>
          </div>

          <div className="flex-1 h-0.5 bg-outline-variant/50 mx-2" />

          {/* Step 4 */}
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-semibold text-xs">
              4
            </div>
            <span className="font-label-sm text-xs text-on-surface-variant hidden sm:block">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        {/* Main Checkout Column */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Shipping Form Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-ambient border border-outline-variant/30">
            <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/20 pb-3">
              Shipping & Delivery Details
            </h2>

            <form action={placeOrderAction} className="space-y-6">
              {/* Pass applied coupon code */}
              <input type="hidden" name="couponCode" value={appliedCoupon?.code || ""} />

              <CheckoutAddressSelector
                savedAddresses={savedAddresses}
                defaultName={customer?.name || session?.user?.name || ""}
                defaultPhone={customer?.phone || ""}
              />

              {/* Billing Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="same-billing"
                  defaultChecked
                  className="rounded text-primary focus:ring-primary-container h-4 w-4"
                />
                <label htmlFor="same-billing" className="text-xs text-on-surface font-medium cursor-pointer">
                  Use this address as my billing address
                </label>
              </div>

              {/* Payment Method Selection & Trigger (Online Razorpay vs COD) */}
              <div className="pt-6 border-t border-outline-variant/30">
                <h3 className="font-headline-sm text-base font-bold text-on-surface mb-3">
                  Select Payment Method
                </h3>
                <CheckoutPaymentClient
                  appliedCouponCode={appliedCoupon?.code}
                  grandTotalFormatted={grandTotal.toFixed(2)}
                  subtotal={subtotal}
                  shippingTotal={shipping}
                  couponDiscount={discount}
                />
              </div>

              <div className="flex justify-start pt-2">
                <Link
                  href="/cart"
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Return to Cart</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Payment Method Highlights matching stitch */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-ambient">
            <h3 className="font-headline-sm text-base font-bold text-on-surface mb-2">
              Payment Methods
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              All orders are currently dispatched with Pay on Delivery (Cash / UPI on Delivery).
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
              <span className="px-3 py-1.5 bg-surface-container rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">account_balance</span>
                UPI (GPay / PhonePe / Paytm)
              </span>
              <span className="px-3 py-1.5 bg-surface-container rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">credit_card</span>
                Debit / Credit Cards
              </span>
              <span className="px-3 py-1.5 bg-surface-container rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
                Cash on Delivery
              </span>
            </div>
          </div>
        </section>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-3">
              Order Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})
            </h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const image = item.variant.product.images[0];
                return (
                  <div key={item.id} className="flex gap-3.5 items-center">
                    <div className="relative w-16 h-16 bg-surface-container-low rounded-xl overflow-hidden shrink-0 border border-outline-variant/20">
                      {image && (
                        <Image
                          src={image.url}
                          alt={image.altText ?? item.variant.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-on-surface truncate">
                        {item.variant.product.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        {item.variant.packSize} × {item.quantity}
                      </p>
                      <span className="font-bold text-xs text-primary">
                        ₹{(Number(item.priceAtAdd) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Applied Coupon Highlight */}
            {appliedCoupon && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                    local_offer
                  </span>
                  <div>
                    <span className="font-mono font-bold block">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-emerald-700">Coupon applied</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-800">-₹{appliedCoupon.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-on-surface font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-700 font-bold" : "text-on-surface"}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="text-on-surface font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/30 pt-4 mt-4 flex justify-between items-baseline">
              <span className="font-bold text-sm text-on-surface">Total Payable</span>
              <span className="font-headline-sm text-2xl font-bold text-primary">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Prepaid UPI Savings Teaser */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-950">
              <span className="material-symbols-outlined text-emerald-700 text-lg shrink-0">
                savings
              </span>
              <span>
                <strong>Save ₹{Math.round(subtotal * 0.05)} extra</strong> by paying online via UPI / Cards at checkout!
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
