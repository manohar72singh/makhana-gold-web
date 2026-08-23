import crypto from "crypto";

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export function isRazorpayConfigured(): boolean {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    key &&
    secret &&
    !key.includes("placeholder") &&
    !secret.includes("placeholder")
  );
}

export async function createRazorpayOrder({
  amountPaise,
  receipt,
  notes = {},
}: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // If real keys are provided, call Razorpay REST API
  if (isRazorpayConfigured() && keyId && keySecret) {
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: Math.round(amountPaise),
        currency: "INR",
        receipt,
        notes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    return (await response.json()) as RazorpayOrderResponse;
  }

  // Graceful Sandbox / Test Simulation fallback
  return {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    amount: Math.round(amountPaise),
    currency: "INR",
    receipt,
    status: "created",
  };
}

export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!isRazorpayConfigured()) {
    // In simulated test mode, verify if IDs are present
    return Boolean(razorpayOrderId && razorpayPaymentId);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}

export function verifyRazorpayWebhookSignature(
  body: string,
  signature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.includes("placeholder")) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
