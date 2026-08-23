import Image from "next/image";
import Link from "next/link";
import { getCartWithItems } from "@/lib/cart";
import { updateCartItemAction, removeCartItemAction } from "./actions";
import { CartSummaryClient } from "./CartSummaryClient";

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;

export default async function CartPage() {
  const cart = await getCartWithItems();

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
    0
  );
  const freeShippingLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <main className="grow pt-6 sm:pt-8 pb-16 sm:pb-huge px-5 sm:px-gutter max-w-container-max mx-auto w-full">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-8 sm:mb-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-label-md text-xs sm:text-sm">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span className="font-bold">Your Bag</span>
          </div>

          <div className="w-8 sm:w-12 md:w-20 h-0.5 bg-primary-container/40" />

          <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant font-label-md text-xs sm:text-sm opacity-60">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-outline-variant flex items-center justify-center font-semibold text-xs">
              2
            </span>
            <span>Delivery</span>
          </div>

          <div className="w-8 sm:w-12 md:w-20 h-0.5 bg-outline-variant/40" />

          <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant font-label-md text-xs sm:text-sm opacity-60">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-outline-variant flex items-center justify-center font-semibold text-xs">
              3
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {/* On mobile: Order Summary at top (better UX), items below */}
      {/* On lg+: side-by-side layout */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-start">
        {/* Order Summary — shown at top on mobile via order, right on desktop */}
        {cart.items.length > 0 && (
          <div className="w-full lg:w-[420px] shrink-0 order-first lg:order-last lg:sticky lg:top-28">
            <CartSummaryClient subtotal={subtotal} />
          </div>
        )}

        {/* Cart Items Column */}
        <div className="flex-1 w-full space-y-4 order-last lg:order-first">
          <div className="flex justify-between items-baseline mb-3 sm:mb-4">
            <h1 className="font-headline-xl text-xl sm:text-2xl md:text-3xl font-bold text-on-surface">
              Your Shopping Bag
            </h1>
            <span className="font-body-md text-sm text-on-surface-variant">
              ({cart.items.reduce((s, i) => s + i.quantity, 0)} Items)
            </span>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-3.5 sm:p-4 mb-5 sm:mb-6">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                {freeShippingLeft === 0
                  ? "🎉 You have unlocked Free Standard Shipping!"
                  : `Add ₹${freeShippingLeft.toFixed(0)} more for FREE Delivery`}
              </span>
              <span className="text-primary">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 text-center border border-outline-variant/30 shadow-ambient">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">shopping_bag</span>
              </div>
              <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface mb-2">
                Your Bag is Currently Empty
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
                Explore our hand-roasted fox nuts and curated artisanal gift collections.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#D84315] hover:bg-secondary text-white px-6 sm:px-8 py-3.5 rounded-xl font-label-md text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Discover Our Flavours</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          ) : (
            cart.items.map((item) => {
              const image = item.variant.product.images[0];
              const unitPrice = Number(item.priceAtAdd);
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 flex gap-4 items-start sm:items-center shadow-ambient border border-outline-variant/30 hover:border-primary-container/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-container-low shrink-0 overflow-hidden border border-outline-variant/20">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.altText ?? item.variant.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Info + Actions */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.variant.product.slug}`}
                      className="font-headline-sm text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.variant.product.name}
                    </Link>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Pack: <span className="font-semibold">{item.variant.packSize}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-body-lg text-sm font-bold text-primary">
                        ₹{unitPrice.toFixed(0)}
                      </span>
                      <span className="text-xs text-on-surface-variant">/ each</span>
                    </div>

                    {/* Quantity & Remove — below text on mobile */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant/20">
                      <div className="flex items-center border border-outline-variant/60 rounded-xl overflow-hidden bg-surface-bright shadow-xs">
                        <form action={updateCartItemAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity - 1} />
                          <button
                            type="submit"
                            aria-label="Decrease quantity"
                            className="px-3 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                        </form>

                        <span className="px-3 font-label-md text-sm font-bold text-on-surface min-w-6 text-center">
                          {item.quantity}
                        </span>

                        <form action={updateCartItemAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity + 1} />
                          <button
                            type="submit"
                            aria-label="Increase quantity"
                            className="px-3 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </form>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-on-surface block">
                          ₹{itemTotal.toFixed(0)}
                        </span>
                        <form action={removeCartItemAction} className="mt-1">
                          <input type="hidden" name="itemId" value={item.id} />
                          <button
                            type="submit"
                            aria-label="Remove item"
                            className="text-xs text-outline hover:text-error transition-colors cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Remove</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
