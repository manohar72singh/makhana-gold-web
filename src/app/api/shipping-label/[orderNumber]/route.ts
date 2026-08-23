import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/content";

function generateSvgBarcode(code: string): string {
  // Generate high-density visual barcode pattern
  const bars: string[] = [];
  let x = 10;
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const pattern = [(charCode % 3) + 1, ((charCode >> 1) % 3) + 1, ((charCode >> 2) % 3) + 1];
    for (const width of pattern) {
      bars.push(`<rect x="${x}" y="0" width="${width * 1.8}" height="45" fill="#000"/>`);
      x += width * 1.8 + 2.2;
    }
  }
  return `<svg width="100%" height="45" viewBox="0 0 ${x + 10} 45" xmlns="http://www.w3.org/2000/svg">${bars.join("")}</svg>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findFirst({
      where: { orderNumber },
      include: {
        customer: true,
        shippingAddress: true,
        items: true,
      },
    }),
    getSiteSettings(),
  ]);

  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  const awbNumber = order.trackingNumber || `DEL-${order.id.toString().padStart(9, "0")}`;
  const courier = order.courierPartner || "Delhivery Express Surface";
  const storeName = settings["store_name"] || "Makhana Gold India Pvt. Ltd.";
  const studioAddress =
    settings["studio_address"] ||
    "Makhana Gold Processing Hub, Industrial Area, Mithila, Bihar - 846004";
  const supportPhone = settings["support_phone"] || "+91 60016 84216";

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const estimatedWeightKg = (totalItems * 0.25).toFixed(2);
  const isCod = order.paymentStatus !== "paid";
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const barcodeSvg = generateSvgBarcode(awbNumber);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shipping Label - ${order.orderNumber}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #fff;
      color: #000;
      width: 100mm;
      min-height: 150mm;
      padding: 4mm;
      margin: 0 auto;
      font-size: 11px;
      line-height: 1.25;
    }
    .label-box {
      border: 2px solid #000;
      height: 142mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      border-bottom: 2px solid #000;
      padding: 2.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .courier-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .courier-badge {
      border: 1.5px solid #000;
      padding: 1mm 2mm;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .barcode-section {
      border-bottom: 2px solid #000;
      padding: 2mm 3mm;
      text-align: center;
    }
    .awb-text {
      font-size: 13px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 2px;
      margin-top: 1mm;
    }
    .routing-banner {
      border-bottom: 2px solid #000;
      background: #000;
      color: #fff;
      padding: 2mm 3mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pincode-lg {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .destination-city {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: right;
    }
    .address-section {
      border-bottom: 2px solid #000;
      padding: 3mm;
      flex: 1;
    }
    .section-tag {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 1.5mm;
      display: block;
    }
    .recipient-name {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 1mm;
    }
    .recipient-phone {
      font-size: 12px;
      font-weight: 900;
      margin-top: 2mm;
    }
    .payment-box {
      border-bottom: 2px solid #000;
      padding: 2.5mm 3mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${isCod ? "#000" : "#f5f5f5"};
      color: ${isCod ? "#fff" : "#000"};
    }
    .payment-type {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .payment-amount {
      font-size: 15px;
      font-weight: 900;
    }
    .item-summary {
      border-bottom: 1px solid #000;
      padding: 2mm 3mm;
      font-size: 9.5px;
      max-height: 20mm;
      overflow: hidden;
    }
    .return-footer {
      padding: 2mm 3mm;
      font-size: 8.5px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .print-bar {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #D84315;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: none;
      font-size: 12px;
    }
    @media print {
      .print-bar {
        display: none;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <button class="print-bar" onclick="window.print()">🖨️ Print Label (4x6)</button>

  <div class="label-box">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="courier-title">${courier}</div>
        <div style="font-size: 9px; font-weight: bold; color: #555;">STANDARD EXPEDITED AIR/SURFACE</div>
      </div>
      <div class="courier-badge">
        ${isCod ? "COD SHIPMENT" : "PREPAID AIR"}
      </div>
    </div>

    <!-- Barcode -->
    <div class="barcode-section">
      ${barcodeSvg}
      <div class="awb-text">${awbNumber}</div>
    </div>

    <!-- Routing / Destination Pincode Banner -->
    <div class="routing-banner">
      <div>
        <div style="font-size: 8px; text-transform: uppercase; opacity: 0.8;">DESTINATION PINCODE</div>
        <div class="pincode-lg">${order.shippingAddress?.pincode || "110001"}</div>
      </div>
      <div class="destination-city">
        <div>${order.shippingAddress?.city || "DELHI"}</div>
        <div style="font-size: 9px; opacity: 0.9;">${order.shippingAddress?.state || "IN"}</div>
      </div>
    </div>

    <!-- Delivery Address -->
    <div class="address-section">
      <span class="section-tag">DELIVER TO / SHIP TO:</span>
      <div class="recipient-name">${order.customer?.name || "Customer"}</div>
      <div>${order.shippingAddress?.line1 || "Customer Address"}</div>
      ${order.shippingAddress?.line2 ? `<div>${order.shippingAddress.line2}</div>` : ""}
      <div>${order.shippingAddress?.city}, ${order.shippingAddress?.state} - <strong>${order.shippingAddress?.pincode}</strong></div>
      <div class="recipient-phone">📞 TEL / MOB: ${order.customer?.phone || supportPhone}</div>
    </div>

    <!-- Payment Banner -->
    <div class="payment-box">
      <div>
        <div style="font-size: 8px; text-transform: uppercase; opacity: 0.8;">PAYMENT TERMS:</div>
        <div class="payment-type">${isCod ? "COLLECT CASH ON DELIVERY" : "PREPAID • DO NOT COLLECT CASH"}</div>
      </div>
      <div class="payment-amount">${isCod ? `₹${Number(order.grandTotal).toFixed(0)}` : "PAID"}</div>
    </div>

    <!-- Items & Package Specs -->
    <div class="item-summary">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 1mm;">
        <span>Order #${order.orderNumber} (${orderDate})</span>
        <span>Weight: ~${estimatedWeightKg} kg | Qty: ${totalItems}</span>
      </div>
      <div>
        ${order.items.map((it) => `${it.productName} (${it.variantName}) × ${it.quantity}`).join(" • ")}
      </div>
    </div>

    <!-- Return Address Footer -->
    <div class="return-footer">
      <div>
        <strong>RETURN IF UNDELIVERED TO:</strong><br>
        ${storeName}<br>
        ${studioAddress}<br>
        Helpline: ${supportPhone}
      </div>
      <div style="text-align: right; font-size: 8px;">
        100% Certified Bihar Foxnuts<br>
        FSSAI: ${settings["fssai_license"] || "10021022000123"}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
