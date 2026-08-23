import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/content";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        customer: true,
        coupon: true,
      },
    }),
    getSiteSettings(),
  ]);

  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  // Security check: if customer is logged in, verify ownership (or admin)
  if (customerId && order.customerId !== customerId) {
    // Check if admin user
    const admin = await prisma.adminUser.findFirst({
      where: { email: session?.user?.email || "" },
    });
    if (!admin) {
      return new NextResponse("Unauthorized access to invoice", { status: 403 });
    }
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountTotal);
  const taxableValue = Math.max(0, subtotal - discount);
  const cgst = (taxableValue * 0.025).toFixed(2);
  const sgst = (taxableValue * 0.025).toFixed(2);
  const shipping = Number(order.shippingTotal);
  const grandTotal = Number(order.grandTotal);

  const address = order.shippingAddress || {
    line1: "123 Generational Lane",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  };

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GST Tax Invoice - ${order.orderNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      background-color: #f7f7f7;
      color: #1a1a1a;
      -webkit-print-color-adjust: exact;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #eaeaea;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #D84315;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #8C6D3F;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .invoice-title {
      text-align: right;
      font-size: 22px;
      font-weight: 800;
      color: #D84315;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-grid {
      width: 100%;
      margin-bottom: 30px;
      font-size: 12px;
    }
    .meta-box {
      background-color: #FAF8F5;
      border: 1px solid #EFEAE1;
      border-radius: 8px;
      padding: 14px;
      line-height: 1.5;
    }
    .meta-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #8C6D3F;
      margin-bottom: 6px;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 12px;
    }
    .item-table th {
      background-color: #FAF8F5;
      border-top: 1px solid #E0D7C6;
      border-bottom: 2px solid #E0D7C6;
      padding: 10px 8px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      color: #4A3B28;
      font-size: 11px;
    }
    .item-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #EFEAE1;
    }
    .totals-table {
      width: 320px;
      margin-left: auto;
      font-size: 12px;
      line-height: 1.8;
      border-collapse: collapse;
    }
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .grand-total {
      border-top: 2px solid #1a1a1a;
      font-size: 15px;
      font-weight: 800;
      color: #D84315;
      padding-top: 8px;
    }
    .footer-note {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #E0D7C6;
      font-size: 11px;
      color: #777;
      text-align: center;
    }
    .print-btn {
      display: inline-block;
      margin-bottom: 20px;
      background: #D84315;
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      cursor: pointer;
      border: none;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto;" class="no-print">
    <button onclick="window.print()" class="print-btn">🖨️ Print / Save as PDF</button>
  </div>

  <div class="invoice-card">
    <table class="header-table" role="presentation">
      <tr>
        <td>
          <div class="brand-title">${settings["store_name"] || "Makhana Gold"}</div>
          <div class="brand-sub">${settings["store_tagline"] || "Pure • Healthy • Premium"}</div>
          <div style="font-size: 11px; color: #555; margin-top: 6px;">
            ${settings["studio_address"] || "Makhana Gold India Pvt. Ltd., Mithila Agro Processing Park, Bihar - 846004"}<br>
            <strong>GSTIN:</strong> ${settings["gstin_number"] || "10AAACM1234F1Z5"} | <strong>FSSAI:</strong> ${settings["fssai_license"] || "10021022000123"}<br>
            <strong>Support:</strong> ${settings["support_email"] || "mmakhanaltd@gmail.com"} | ${settings["support_phone"] || "+91 60016 84216"}
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="invoice-title">Tax Invoice</div>
          <div style="font-size: 12px; margin-top: 6px; color: #333;">
            <strong>Invoice No:</strong> INV-${order.orderNumber}<br>
            <strong>Date:</strong> ${invoiceDate}<br>
            <strong>Payment Mode:</strong> ${order.paymentStatus === "paid" ? "Online (Razorpay)" : "Pay on Delivery (COD)"}
          </div>
        </td>
      </tr>
    </table>

    <table class="meta-grid" role="presentation">
      <tr>
        <td width="48%" valign="top">
          <div class="meta-box">
            <div class="meta-title">Billed & Shipped To:</div>
            <strong>${order.customer?.name || "Valued Customer"}</strong><br>
            ${address.line1}<br>
            ${address.city}, ${address.state} - ${address.pincode}<br>
            ${order.customer?.phone ? `Phone: ${order.customer.phone}<br>` : ""}
            Email: ${order.customer?.email}
          </div>
        </td>
        <td width="4%"></td>
        <td width="48%" valign="top">
          <div class="meta-box">
            <div class="meta-title">Order Logistics:</div>
            <strong>Order Ref:</strong> #${order.orderNumber}<br>
            <strong>Place of Supply:</strong> ${address.state} (State Code: 07)<br>
            <strong>Reverse Charge:</strong> No<br>
            <strong>HSN Category:</strong> 19041090 (Prepared Foods / Roasted Foxnuts)
          </div>
        </td>
      </tr>
    </table>

    <table class="item-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Goods</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item.productName}</strong> - ${item.variantName}</td>
            <td>19041090</td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align: right;">₹${Number(item.lineTotal).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <table class="totals-table">
      <tr>
        <td>Subtotal:</td>
        <td>₹${subtotal.toFixed(2)}</td>
      </tr>
      ${
        discount > 0
          ? `
      <tr style="color: #2E7D32;">
        <td>Coupon Discount (${order.coupon?.code || "PROMO"}):</td>
        <td>-₹${discount.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
      <tr>
        <td>Taxable Value:</td>
        <td>₹${taxableValue.toFixed(2)}</td>
      </tr>
      <tr>
        <td>CGST (2.5%):</td>
        <td>₹${cgst}</td>
      </tr>
      <tr>
        <td>SGST (2.5%):</td>
        <td>₹${sgst}</td>
      </tr>
      <tr>
        <td>Shipping & Handling:</td>
        <td>${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</td>
      </tr>
      <tr class="grand-total">
        <td>Total Invoice Amount:</td>
        <td>₹${grandTotal.toFixed(2)}</td>
      </tr>
    </table>

    <div class="footer-note">
      This is a computer generated invoice and does not require a physical signature.<br>
      Thank you for choosing <strong>Makhana Gold</strong>. Sourced responsibly from certified Bihar wetlands.
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(invoiceHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
