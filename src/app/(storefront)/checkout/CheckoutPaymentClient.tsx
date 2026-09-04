"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  initiateOnlineOrderAction,
  verifyAndCompletePaymentAction,
} from "./payment-actions";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function CheckoutPaymentClient({
  appliedCouponCode,
  grandTotalFormatted,
  subtotal = 0,
  shippingTotal = 0,
  couponDiscount = 0,
}: {
  appliedCouponCode?: string;
  grandTotalFormatted: string;
  subtotal?: number;
  shippingTotal?: number;
  couponDiscount?: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // 5% Extra Instant Discount Calculation for Online UPI/Card Payments
  const prepaidSavings = Math.round((subtotal * 0.05) * 100) / 100;
  const onlineDiscountedSubtotal = Math.max(0, subtotal - couponDiscount - prepaidSavings);
  const onlineTax = onlineDiscountedSubtotal * 0.05;
  const onlineGrandTotal = onlineDiscountedSubtotal + shippingTotal + onlineTax;
  const onlineGrandTotalFormatted = onlineGrandTotal.toFixed(2);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const formData = new FormData(form);
    if (appliedCouponCode) {
      formData.set("couponCode", appliedCouponCode);
    }
    formData.set("paymentMethod", paymentMethod);

    try {
      if (paymentMethod === "online") {
        // Step 1: Initiate Order & Razorpay Order on server
        const initRes = await initiateOnlineOrderAction(formData);

        if ("requiresAuth" in initRes && initRes.requiresAuth) {
          router.push("/login?callbackUrl=/checkout");
          return;
        }

        if (!initRes.success) {
          throw new Error("Failed to initiate online checkout.");
        }

        // If Razorpay keys are configured, launch Razorpay Checkout Modal
        if (initRes.isConfigured) {
          const isLoaded = await loadRazorpayScript();
          if (!isLoaded) {
            throw new Error("Could not load payment gateway SDK. Please check your internet connection.");
          }

          const options = {
            key: initRes.keyId,
            amount: initRes.amountPaise,
            currency: initRes.currency,
            name: "Makhana Gold",
            description: `Order #${initRes.orderNumber}`,
            image: "/images/logo/logo.png",
            order_id: initRes.razorpayOrderId,
            prefill: {
              name: initRes.customer.name,
              email: initRes.customer.email,
              contact: initRes.customer.phone,
            },
            theme: {
              color: "#D84315", // Signature Gold/Vermillion
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: async function (response: any) {
              try {
                const verifyRes = await verifyAndCompletePaymentAction({
                  orderId: initRes.orderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                });
                router.push(`/checkout/confirmed/${verifyRes.orderNumber}?payment=success`);
              } catch (err: unknown) {
                setErrorMessage(err instanceof Error ? err.message : "Payment verification failed.");
                setIsProcessing(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Simulation mode when placeholder keys exist in development
          const verifyRes = await verifyAndCompletePaymentAction({
            orderId: initRes.orderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpayOrderId: initRes.razorpayOrderId,
            razorpaySignature: "simulated_signature",
          });
          router.push(`/checkout/confirmed/${verifyRes.orderNumber}?payment=simulated`);
        }
      } else {
        // Cash On Delivery
        form.submit();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong while placing your order.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Options Radio Cards */}
      <div className="space-y-3">
        {/* 1. Online Payment (Razorpay UPI with 5% Instant Discount) */}
        <label
          className={`flex items-start justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            paymentMethod === "online"
              ? "border-[#D84315] bg-amber-500/10 shadow-xs ring-1 ring-[#D84315]/30"
              : "border-amber-900/10 bg-white hover:border-amber-400"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <input
              type="radio"
              name="paymentChoice"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
              className="mt-1 accent-[#D84315] w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm text-on-surface">
                  UPI, Cards &amp; NetBanking
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
                  ⚡ Extra 5% OFF (Save ₹{prepaidSavings.toFixed(0)})
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Pay via Google Pay, PhonePe, Paytm, Cards, or NetBanking. Instant 5% prepaid savings applied!
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-950 font-semibold">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                <span>Final Payable: ₹{onlineGrandTotalFormatted}</span>
                <span className="text-[10px] text-emerald-700 line-through">₹{grandTotalFormatted}</span>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-2xl text-[#D84315] shrink-0">
            account_balance_wallet
          </span>
        </label>

        {/* 2. Cash on Delivery (COD) */}
        <label
          className={`flex items-start justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            paymentMethod === "cod"
              ? "border-amber-600 bg-amber-500/5 shadow-xs"
              : "border-amber-900/10 bg-white hover:border-amber-400"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <input
              type="radio"
              name="paymentChoice"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="mt-1 accent-[#D84315] w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-on-surface">
                  Cash on Delivery (COD)
                </span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  Standard Rate
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Pay in cash or via QR scan upon doorstep delivery (₹{grandTotalFormatted}).
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-2xl text-amber-700 shrink-0">
            payments
          </span>
        </label>
      </div>

      {/* Submit Button (Triggers Razorpay or COD) */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={(e) => {
          const form = (e.target as HTMLElement).closest("form");
          if (form) {
            if (!form.reportValidity()) {
              return;
            }
            const fakeEvent = {
              preventDefault: () => {},
              currentTarget: form,
            } as React.FormEvent<HTMLFormElement>;
            handlePaymentSubmit(fakeEvent);
          }
        }}
        className="w-full bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white font-label-md text-sm uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-vermillion-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-bold"
      >
        <span className="material-symbols-outlined text-[20px]">
          {isProcessing ? "hourglass_empty" : paymentMethod === "online" ? "lock" : "local_shipping"}
        </span>
        <span>
          {isProcessing
            ? "Securing Order..."
            : paymentMethod === "online"
              ? `Pay ₹${onlineGrandTotalFormatted} (Save ₹${prepaidSavings.toFixed(0)}) & Place Order`
              : `Place Order (COD - ₹${grandTotalFormatted})`}
        </span>
      </button>
    </div>
  );
}
