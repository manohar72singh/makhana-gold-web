import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { adminAuth } from "@/lib/auth-admin";
import { getSiteSettings } from "@/lib/content";

const STATE_CODE_MAP: Record<string, string> = {
  "jammu and kashmir": "01",
  "himachal pradesh": "02",
  "punjab": "03",
  "chandigarh": "04",
  "uttarakhand": "05",
  "haryana": "06",
  "delhi": "07",
  "rajasthan": "08",
  "uttar pradesh": "09",
  "bihar": "10",
  "sikkim": "11",
  "arunachal pradesh": "12",
  "nagaland": "13",
  "manipur": "14",
  "mizoram": "15",
  "tripura": "16",
  "meghalaya": "17",
  "assam": "18",
  "west bengal": "19",
  "jharkhand": "20",
  "odisha": "21",
  "chhattisgarh": "22",
  "madhya pradesh": "23",
  "gujarat": "24",
  "daman and diu": "25",
  "dadra and nagar haveli": "26",
  "maharashtra": "27",
  "andhra pradesh": "28",
  "karnataka": "29",
  "goa": "30",
  "lakshadweep": "31",
  "kerala": "32",
  "tamil nadu": "33",
  "puducherry": "34",
  "andaman and nicobar islands": "35",
  "telangana": "36",
  "ladakh": "37",
};

function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertHundreds(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  let num = rounded;
  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore > 0) result += convertHundreds(crore) + " Crore ";
  if (lakh > 0) result += convertHundreds(lakh) + " Lakh ";
  if (thousand > 0) result += convertHundreds(thousand) + " Thousand ";
  if (hundred > 0) result += convertHundreds(hundred) + " ";

  return (result.trim() + " Rupees Only").replace(/\s+/g, " ");
}

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

  // Security check: Must be owner or admin
  if (!customerId || order.customerId !== customerId) {
    const adminSession = await adminAuth();
    if (!adminSession?.user) {
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
  const shipping = Number(order.shippingTotal);
  const grandTotal = Number(order.grandTotal);

  const address = order.shippingAddress || {
    line1: "Delivery Destination",
    line2: "",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
  };

  // State Code & GST Determination
  const buyerStateClean = (address.state || "Bihar").toLowerCase().trim();
  let buyerStateCode = STATE_CODE_MAP[buyerStateClean] || "10";
  if (order.gstin && order.gstin.length >= 2) {
    const prefix = order.gstin.slice(0, 2);
    if (/^\d{2}$/.test(prefix)) {
      buyerStateCode = prefix;
    }
  }

  // Seller State is Bihar (State Code 10)
  const isIntraState = buyerStateCode === "10" || buyerStateClean === "bihar";
  const isB2b = Boolean(order.isB2b && order.gstin);

  const cgstAmount = isIntraState ? (taxableValue * 0.025).toFixed(2) : "0.00";
  const sgstAmount = isIntraState ? (taxableValue * 0.025).toFixed(2) : "0.00";
  const igstAmount = !isIntraState ? (taxableValue * 0.05).toFixed(2) : "0.00";
  const totalTaxAmount = (Number(cgstAmount) + Number(sgstAmount) + Number(igstAmount)).toFixed(2);

  const invoiceTitle = isB2b
    ? "B2B TAX INVOICE (INPUT TAX CREDIT ELIGIBLE)"
    : "TAX INVOICE (RETAIL / B2C)";

  const amountInWords = numberToWordsINR(grandTotal);

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${isB2b ? "B2B GST Tax Invoice" : "GST Tax Invoice"} - ${order.orderNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      background-color: #f7f7f7;
      color: #1a1a1a;
      -webkit-print-color-adjust: exact;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #eaeaea;
    }
    .b2b-banner {
      background: ${isB2b ? "#064e3b" : "#451a03"};
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #D84315;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
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
      font-size: 20px;
      font-weight: 900;
      color: #D84315;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-grid {
      width: 100%;
      margin-bottom: 22px;
      font-size: 12px;
    }
    .meta-box {
      background-color: #FAF8F5;
      border: 1px solid #EFEAE1;
      border-radius: 8px;
      padding: 12px 14px;
      line-height: 1.55;
    }
    .meta-box-b2b {
      background-color: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 8px;
      padding: 12px 14px;
      line-height: 1.55;
    }
    .meta-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #8C6D3F;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .meta-title-b2b {
      color: #047857;
    }
    .gst-tag {
      background: #047857;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11.5px;
    }
    .item-table th {
      background-color: #FAF8F5;
      border-top: 1px solid #E0D7C6;
      border-bottom: 2px solid #E0D7C6;
      padding: 9px 8px;
      text-align: left;
      font-weight: 800;
      text-transform: uppercase;
      color: #4A3B28;
      font-size: 10.5px;
    }
    .item-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #EFEAE1;
    }
    .tax-breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 6px;
    }
    .tax-breakdown-table th {
      background: #f5f5f4;
      padding: 7px 8px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      color: #57534e;
      border-bottom: 1px solid #e7e5e4;
    }
    .tax-breakdown-table td {
      padding: 7px 8px;
      border-bottom: 1px solid #f0f0ef;
    }
    .totals-table {
      width: 340px;
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
      font-weight: 900;
      color: #D84315;
      padding-top: 6px;
    }
    .words-box {
      font-size: 11px;
      background: #FAF8F5;
      padding: 10px 14px;
      border-radius: 6px;
      border-left: 3px solid #D84315;
      margin-top: 14px;
      margin-bottom: 20px;
    }
    .footer-section {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px dashed #E0D7C6;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #666;
    }
    .signatory-box {
      text-align: center;
      width: 200px;
    }
    .signatory-line {
      border-top: 1px solid #333;
      margin-top: 40px;
      padding-top: 4px;
      font-weight: 700;
      color: #1a1a1a;
      font-size: 11px;
    }
    .print-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      background: #D84315;
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(216,67,21,0.25);
    }
    .print-btn:hover {
      background: #bf360c;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; width: 100%; }
      .no-print { display: none; }
      @page { margin: 12mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div style="max-width: 820px; margin: 0 auto;" class="no-print">
    <button onclick="window.print()" class="print-btn">
      <span>🖨️ Print / Save as PDF (A4)</span>
    </button>
  </div>

  <div class="invoice-card">
    <div class="b2b-banner">
      <span>${invoiceTitle}</span>
      <span>HSN: 19041090 • GST 5%</span>
    </div>

    <table class="header-table" role="presentation">
      <tr>
        <td style="vertical-align: top;">
          <div class="brand-title">${settings["store_name"] || "Makhana Gold"}</div>
          <div class="brand-sub">${settings["store_tagline"] || "Pure • Generational • Handpicked"}</div>
          <div style="font-size: 11px; color: #444; margin-top: 6px; line-height: 1.5;">
            ${settings["studio_address"] || "Mithilanchal Makhana Udyogikaran Pvt. Ltd., Mithila Agro Processing Park, Bihar - 846004"}<br>
            <strong>Supplier GSTIN:</strong> ${settings["gstin_number"] || "10AAACM1234F1Z5"} (State Code: 10 - Bihar)<br>
            <strong>FSSAI Lic. No:</strong> ${settings["fssai_license"] || "10021022000123"} | <strong>PAN:</strong> AAACM1234F<br>
            <strong>Contact:</strong> ${settings["support_email"] || "mmakhanaltd@gmail.com"} | ${settings["support_phone"] || "+91 60016 84216"}
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="invoice-title">Tax Invoice</div>
          <div style="font-size: 12px; margin-top: 6px; color: #222; line-height: 1.6;">
            <strong>Invoice No:</strong> INV-${order.orderNumber}<br>
            <strong>Invoice Date:</strong> ${invoiceDate}<br>
            <strong>Order Ref:</strong> #${order.orderNumber}<br>
            <strong>Payment Mode:</strong> ${order.paymentStatus === "paid" ? "PREPAID (Online)" : "CASH ON DELIVERY (COD)"}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}
          </div>
        </td>
      </tr>
    </table>

    <table class="meta-grid" role="presentation">
      <tr>
        <td width="48%" valign="top">
          <div class="${isB2b ? "meta-box-b2b" : "meta-box"}">
            <div class="${isB2b ? "meta-title meta-title-b2b" : "meta-title"}">
              <span>${isB2b ? "Billed To (Business Entity):" : "Billed & Shipped To:"}</span>
              ${isB2b ? `<span class="gst-tag">ITC CLAIMABLE</span>` : ""}
            </div>
            ${isB2b ? `<strong>${order.companyName}</strong><br>` : ""}
            <strong>Attn:</strong> ${order.customer?.name || "Valued Customer"}<br>
            ${isB2b && order.gstin ? `<strong>Buyer GSTIN:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: 800; color: #065f46;">${order.gstin}</span><br>` : ""}
            ${address.line1}${address.line2 ? `, ${address.line2}` : ""}<br>
            ${address.city}, ${address.state} — <strong>${address.pincode}</strong><br>
            ${order.customer?.phone ? `Phone: ${order.customer.phone} | ` : ""}Email: ${order.customer?.email}
          </div>
        </td>
        <td width="4%"></td>
        <td width="48%" valign="top">
          <div class="meta-box">
            <div class="meta-title">Logistics &amp; GST Compliance:</div>
            <strong>Place of Supply:</strong> ${address.state} (State Code: ${buyerStateCode})<br>
            <strong>Supply Type:</strong> ${isIntraState ? "Intra-State Supply (CGST + SGST)" : "Inter-State Supply (IGST)"}<br>
            <strong>Reverse Charge Applicable:</strong> No<br>
            <strong>HSN Category:</strong> 19041090 (Prepared Foods / Popped Foxnuts)<br>
            ${order.trackingNumber ? `<strong>AWB / Tracking:</strong> ${order.trackingNumber} (${order.courierPartner || "Express Courier"})` : "<strong>Fulfillment:</strong> Dispatched via Surface Express"}
          </div>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table class="item-table">
      <thead>
        <tr>
          <th width="5%">#</th>
          <th width="45%">Description of Goods</th>
          <th width="12%">HSN Code</th>
          <th width="8%">Qty</th>
          <th width="15%">Unit Price</th>
          <th width="15%" style="text-align: right;">Taxable Amount</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.productName}</strong>
              <div style="font-size: 10px; color: #666;">Pack Size: ${item.variantName}</div>
            </td>
            <td style="font-family: monospace;">19041090</td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align: right; font-weight: 600;">₹${Number(item.lineTotal).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- GST Tax Breakdown Summary -->
    <table class="tax-breakdown-table">
      <thead>
        <tr>
          <th>HSN</th>
          <th>Taxable Value</th>
          ${
            isIntraState
              ? `
            <th>CGST Rate</th>
            <th>CGST Amount</th>
            <th>SGST Rate</th>
            <th>SGST Amount</th>
          `
              : `
            <th>IGST Rate</th>
            <th>IGST Amount</th>
          `
          }
          <th style="text-align: right;">Total Tax</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family: monospace;">19041090</td>
          <td>₹${taxableValue.toFixed(2)}</td>
          ${
            isIntraState
              ? `
            <td>2.5%</td>
            <td>₹${cgstAmount}</td>
            <td>2.5%</td>
            <td>₹${sgstAmount}</td>
          `
              : `
            <td>5.0%</td>
            <td>₹${igstAmount}</td>
          `
          }
          <td style="text-align: right; font-weight: 700;">₹${totalTaxAmount}</td>
        </tr>
      </tbody>
    </table>

    <!-- Order Totals -->
    <table class="totals-table">
      <tr>
        <td>Subtotal (Gross):</td>
        <td>₹${subtotal.toFixed(2)}</td>
      </tr>
      ${
        discount > 0
          ? `
      <tr style="color: #15803d; font-weight: 600;">
        <td>Discount (${order.couponId ? "Coupon / Offer" : "Special Savings"}):</td>
        <td>-₹${discount.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
      <tr>
        <td>Taxable Amount:</td>
        <td>₹${taxableValue.toFixed(2)}</td>
      </tr>
      ${
        isIntraState
          ? `
      <tr>
        <td>CGST (2.5%):</td>
        <td>₹${cgstAmount}</td>
      </tr>
      <tr>
        <td>SGST (2.5%):</td>
        <td>₹${sgstAmount}</td>
      </tr>
      `
          : `
      <tr>
        <td>IGST (5.0%):</td>
        <td>₹${igstAmount}</td>
      </tr>
      `
      }
      <tr>
        <td>Shipping &amp; Handling:</td>
        <td>${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</td>
      </tr>
      <tr class="grand-total">
        <td>Total Invoice Amount:</td>
        <td>₹${grandTotal.toFixed(2)}</td>
      </tr>
    </table>

    <!-- Amount in Words -->
    <div class="words-box">
      <strong>Amount in Words:</strong> ${amountInWords}
    </div>

    <!-- Footer & Signatory -->
    <div class="footer-section">
      <div style="line-height: 1.5; max-width: 480px;">
        <strong>Terms &amp; Conditions:</strong><br>
        1. All food products are packaged under strict FSSAI food safety protocols.<br>
        2. Certified authentic Mithilanchal Geographical Indication (GI) fox nuts.<br>
        3. This is an authentic computer-generated GST tax invoice; physical signature is not required.<br>
        4. Subject to Bihar jurisdiction.
      </div>
      <div class="signatory-box">
        <div style="font-size: 10px; color: #888; text-transform: uppercase;">For Makhana Gold</div>
        <div class="signatory-line">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(invoiceHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
