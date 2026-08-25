export interface OrderEmailItem {
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://makhanagold.com").replace(/\/+$/, "");

export interface OrderEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  subtotal: number | string;
  discountTotal: number | string;
  shippingTotal: number | string;
  taxTotal: number | string;
  grandTotal: number | string;
  paymentStatus: string;
  paymentReference?: string | null;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  trackingUrl?: string;
  invoiceUrl?: string;
}

export function generateOrderConfirmationEmailHtml(props: OrderEmailProps): string {
  const isPaid = props.paymentStatus === "paid";

  const itemsHtml = props.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F1ECE1;">
        <td style="padding: 12px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #1C150C; font-weight: 600;">
          ${item.productName}
          <div style="font-size: 11px; color: #786C5E; font-weight: normal; margin-top: 2px;">
            Pack: ${item.variantName} × ${item.quantity}
          </div>
        </td>
        <td style="padding: 12px 0; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #7B241C; font-weight: 700;">
          ₹${Number(item.lineTotal).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - #${props.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid #EFE8DA; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #241607 0%, #150D04 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #F5E6CC; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">
                Makhana Gold
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #D4AF37; letter-spacing: 3px; text-transform: uppercase;">
                Pure • Healthy • Premium
              </p>
            </td>
          </tr>

          <!-- Confirmation Hero -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center;">
              <div style="display: inline-block; background-color: #E8F5E9; color: #2E7D32; font-size: 11px; font-weight: 700; padding: 4px 14px; rounded-radius: 20px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                ✓ Order Confirmed
              </div>
              <h2 style="margin: 0; font-size: 22px; color: #1C150C; font-weight: 700;">
                Thank you for your order, ${props.customerName}!
              </h2>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6D5F4D; line-height: 1.5;">
                Your artisanal fox nuts have been scheduled for fresh origin packaging. We'll dispatch your parcel shortly.
              </p>
              <div style="margin-top: 16px; display: inline-block; background-color: #FAF6EE; border: 1px dashed #D4AF37; border-radius: 12px; padding: 8px 16px; font-family: monospace; font-size: 14px; font-weight: bold; color: #8B4513;">
                Order #${props.orderNumber}
              </div>
            </td>
          </tr>

          <!-- Itemized Table -->
          <tr>
            <td style="padding: 10px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #EFE8DA;">
                    <th align="left" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8B5A2B; font-weight: 700; letter-spacing: 1px;">Item</th>
                    <th align="right" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8B5A2B; font-weight: 700; letter-spacing: 1px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown -->
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #6D5F4D;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td align="right" style="font-weight: 600; color: #1C150C;">₹${Number(props.subtotal).toFixed(2)}</td>
                </tr>
                ${
                  Number(props.discountTotal) > 0
                    ? `
                <tr>
                  <td style="padding: 4px 0; color: #2E7D32;">Privilege Discount</td>
                  <td align="right" style="font-weight: 700; color: #2E7D32;">-₹${Number(props.discountTotal).toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0;">Pan-India Express Shipping</td>
                  <td align="right" style="font-weight: 600; color: #1C150C;">
                    ${Number(props.shippingTotal) === 0 ? '<span style="color: #2E7D32; font-weight: bold;">FREE</span>' : `₹${Number(props.shippingTotal).toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Estimated GST (5%)</td>
                  <td align="right" style="font-weight: 600; color: #1C150C;">₹${Number(props.taxTotal).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #1C150C;">
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 800; color: #1C150C;">Total Paid / Payable</td>
                  <td align="right" style="padding: 12px 0 0 0; font-size: 18px; font-weight: 800; color: #D84315;">₹${Number(props.grandTotal).toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment & Delivery Info Box -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; border-radius: 16px; border: 1px solid #EFE8DA; padding: 16px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px; font-size: 12px;">
                    <strong style="color: #8B5A2B; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; margin-bottom: 4px;">Delivery Address</strong>
                    <div style="color: #1C150C; line-height: 1.4;">
                      ${props.customerName}<br>
                      ${props.shippingAddress.line1}<br>
                      ${props.shippingAddress.line2 ? `${props.shippingAddress.line2}<br>` : ""}
                      ${props.shippingAddress.city}, ${props.shippingAddress.state} - ${props.shippingAddress.pincode}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px; font-size: 12px; border-left: 1px solid #E5DFD1;">
                    <strong style="color: #8B5A2B; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment Status</strong>
                    <div style="color: #1C150C;">
                      ${
                        isPaid
                          ? `<span style="color: #2E7D32; font-weight: bold;">✓ Paid Online (Razorpay)</span><br><span style="font-size: 10px; color: #786C5E;">Ref: ${props.paymentReference || "Captured"}</span>`
                          : `<span style="color: #E65100; font-weight: bold;">Pay on Delivery (COD)</span><br><span style="font-size: 10px; color: #786C5E;">Cash/UPI on arrival</span>`
                      }
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <a href="${APP_URL}/account/orders" style="display: inline-block; background: linear-gradient(135deg, #E64A19 0%, #D84315 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(216,67,21,0.25);">
                Track Order & View Invoice
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6EE; padding: 24px; text-align: center; border-top: 1px solid #EFE8DA; font-size: 11px; color: #8A7B6B;">
              <p style="margin: 0 0 6px 0;">Makhana Gold India Pvt. Ltd. • 100% Certified Bihar Wetland Foxnuts</p>
              <p style="margin: 0;">Need assistance? Reply directly to this email or reach us on WhatsApp at +91 60016 84216.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateNewsletterWelcomeEmailHtml(email: string, promoCode = "GOLDEN15"): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Gold Standard Society</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid #EFE8DA; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #241607 0%, #150D04 100%); padding: 36px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #F5E6CC; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">
                Makhana Gold
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #D4AF37; letter-spacing: 3px; text-transform: uppercase;">
                The Gold Standard Society
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center;">
              <span style="display: inline-block; background-color: #FFF3E0; color: #E65100; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                ✨ Member Privilege Unlocked
              </span>
              <h2 style="margin: 0; font-size: 24px; color: #1C150C; font-weight: 700; line-height: 1.3;">
                Welcome to Guilt-Free Luxury Snacking
              </h2>
              <p style="margin: 12px 0 24px 0; font-size: 14px; color: #6D5F4D; line-height: 1.6;">
                Thank you for joining our conscious community! Sourced responsibly from the generational wetland ponds of Bihar, our fox nuts are slow dry-roasted to deliver unmatched cellular crunch and vital plant protein.
              </p>

              <!-- Promo Code Card -->
              <div style="background: linear-gradient(135deg, #FAF6EE 0%, #F5EEDB 100%); border: 2px dashed #D4AF37; border-radius: 18px; padding: 24px; margin: 0 auto 28px auto; max-width: 440px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #8B5A2B; font-weight: 700;">
                  Your 15% Welcome Privilege
                </p>
                <div style="font-family: monospace; font-size: 26px; font-weight: 800; color: #D84315; letter-spacing: 3px; margin-bottom: 8px;">
                  ${promoCode}
                </div>
                <p style="margin: 0; font-size: 11px; color: #786C5E;">
                  Apply at checkout to enjoy 15% off your entire first harvest.
                </p>
              </div>

              <!-- CTA -->
              <a href="${APP_URL}/shop" style="display: inline-block; background: linear-gradient(135deg, #E64A19 0%, #D84315 100%); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(216,67,21,0.25);">
                Explore Signature Flavours
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6EE; padding: 24px; text-align: center; border-top: 1px solid #EFE8DA; font-size: 11px; color: #8A7B6B;">
              <p style="margin: 0 0 6px 0;">Makhana Gold Pvt. Ltd. • Artisanal Heritage • Modern Wellness</p>
              <p style="margin: 0;">Sent to ${email}. You can unsubscribe anytime by updating your email preferences.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateInquiryAcknowledgementEmailHtml({
  customerName,
  email,
  subject,
  message,
  ticketNumber,
}: {
  customerName: string;
  email: string;
  subject: string;
  message: string;
  ticketNumber: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Ticket #${ticketNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid #EFE8DA; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #241607 0%, #150D04 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; color: #F5E6CC; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">
                Makhana Gold Concierge
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;">
                Customer Care & Corporate Concierge
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #1C150C; font-weight: 700;">
                Namaste ${customerName},
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6D5F4D; line-height: 1.6;">
                We have received your message regarding <strong style="color: #1C150C;">"${subject}"</strong>. Our concierge team has logged your inquiry under ticket <strong style="color: #D84315;">#${ticketNumber}</strong> and will get back to you within <strong>2 to 4 business hours</strong>.
              </p>

              <!-- Message Recap Box -->
              <div style="background-color: #FAF6EE; border-left: 4px solid #D4AF37; border-radius: 0 12px 12px 0; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #8B5A2B;">Your Inquiry Details:</p>
                <p style="margin: 0; font-size: 13px; color: #3A3022; font-style: italic; line-height: 1.5;">
                  &ldquo;${message}&rdquo;
                </p>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 12px; color: #786C5E; line-height: 1.5;">
                If your query is urgent, feel free to WhatsApp us directly at <a href="https://wa.me/916001684216" style="color: #D84315; font-weight: bold; text-decoration: none;">+91 60016 84216</a> (Mon-Sat, 9:30 AM to 6:30 PM IST).
              </p>

              <div style="text-align: center;">
                <a href="${APP_URL}" style="display: inline-block; background: #1C150C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  Return to Makhana Gold
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6EE; padding: 20px; text-align: center; border-top: 1px solid #EFE8DA; font-size: 11px; color: #8A7B6B;">
              <p style="margin: 0;">Makhana Gold Pvt. Ltd. • Connaught Place, New Delhi, India</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export interface BroadcastEmailProps {
  recipientName: string;
  badge?: string | null;
  headline: string;
  message: string;
  couponCode?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  bannerImageUrl?: string | null;
}

export function generateBroadcastEmailHtml(props: BroadcastEmailProps): string {
  const messageFormatted = props.message
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((p) => `<p style="margin: 0 0 16px 0; font-size: 14px; color: #594D3B; line-height: 1.7;">${p.trim()}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid #EFE8DA; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.05);">
          
          <!-- Royal Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #241607 0%, #150D04 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #F5E6CC; letter-spacing: 3px; font-weight: 800; text-transform: uppercase;">
                Makhana Gold
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #D4AF37; letter-spacing: 3px; text-transform: uppercase;">
                Artisanal Heritage • Modern Wellness
              </p>
            </td>
          </tr>

          ${
            props.bannerImageUrl
              ? `
          <!-- Optional Banner Visual -->
          <tr>
            <td style="padding: 0;">
              <img src="${props.bannerImageUrl}" alt="${props.headline}" style="width: 100%; max-height: 240px; object-fit: cover; display: block;" />
            </td>
          </tr>
          `
              : ""
          }

          <!-- Announcement Body -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center;">
              ${
                props.badge
                  ? `
              <div style="display: inline-block; background-color: #FFF3E0; color: #D84315; font-size: 11px; font-weight: 800; padding: 5px 16px; border-radius: 20px; border: 1px solid #FFE0B2; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                ${props.badge}
              </div>
              `
                  : ""
              }

              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1C150C; font-weight: 800; line-height: 1.3;">
                ${props.headline}
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; font-weight: 600; color: #8B5A2B;">
                Namaste ${props.recipientName || "Valued Foodie"},
              </p>

              <div style="text-align: left; background-color: #FCFAF6; border-radius: 16px; padding: 24px; border: 1px solid #F1ECE1; margin-bottom: 24px;">
                ${messageFormatted}
              </div>

              ${
                props.couponCode
                  ? `
              <!-- Promo Coupon Box -->
              <div style="background: linear-gradient(135deg, #FAF6EE 0%, #F5EEDB 100%); border: 2px dashed #D4AF37; border-radius: 18px; padding: 20px; margin: 0 auto 28px auto; max-width: 440px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8B5A2B; font-weight: 700;">
                  Your Exclusive Promo Code
                </p>
                <div style="font-family: monospace; font-size: 26px; font-weight: 800; color: #D84315; letter-spacing: 3px; margin-bottom: 6px;">
                  ${props.couponCode}
                </div>
                <p style="margin: 0; font-size: 12px; color: #786C5E;">
                  Apply at checkout for instant privilege savings.
                </p>
              </div>
              `
                  : ""
              }

              ${
                props.ctaText && props.ctaUrl
                  ? `
              <!-- Call to Action -->
              <div style="margin-top: 10px; margin-bottom: 16px;">
                <a href="${props.ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #E64A19 0%, #D84315 100%); color: #FFFFFF; text-decoration: none; padding: 15px 36px; border-radius: 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(216,67,21,0.28);">
                  ${props.ctaText} →
                </a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Trust Badges Strip -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; border-radius: 16px; border: 1px solid #EFE8DA; padding: 14px;">
                <tr>
                  <td align="center" style="font-size: 11px; color: #786C5E; font-weight: 600;">
                    🌿 100% Wetland Harvest • 🚫 Zero Palm Oil • 📦 Express Pan-India Delivery
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6EE; padding: 24px; text-align: center; border-top: 1px solid #EFE8DA; font-size: 11px; color: #8A7B6B;">
              <p style="margin: 0 0 6px 0; font-weight: 600;">Makhana Gold India Pvt. Ltd. • Artisanal Wetland Harvest</p>
              <p style="margin: 0 0 8px 0;">You received this notification because you are a valued customer or subscribed to the Gold Standard Society.</p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #8B5A2B; text-decoration: none;">Visit Store</a> • 
                <a href="${APP_URL}/shop" style="color: #8B5A2B; text-decoration: none;">Shop Flavours</a> • 
                <a href="https://wa.me/916001684216" style="color: #D84315; text-decoration: none; font-weight: bold;">WhatsApp Concierge</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateAdminNewOrderAlertHtml(props: OrderEmailProps): string {
  const itemsList = props.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #ECE4D8;">
        <td style="padding: 10px 0; font-size: 13px; color: #1C150C;">
          <strong>${item.productName}</strong> (${item.variantName})
        </td>
        <td style="padding: 10px 0; text-align: center; font-size: 13px; color: #594D3B;">
          × ${item.quantity}
        </td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-weight: 700; color: #D84315;">
          ₹${Number(item.lineTotal).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚨 New Order #${props.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6EE; padding: 24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid #EFE8DA; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06);">
          
          <!-- Header Alert -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C150C 0%, #0F0A04 100%); padding: 24px; text-align: center;">
              <span style="display: inline-block; background-color: #D84315; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                🚨 NEW STORE ORDER
              </span>
              <h1 style="margin: 0; font-size: 20px; color: #F5E6CC; letter-spacing: 1px; font-weight: 800;">
                Order #${props.orderNumber}
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #D4AF37;">
                Total Amount: ₹${Number(props.grandTotal).toFixed(2)} • Payment: ${props.paymentStatus.toUpperCase()}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 28px;">
              <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #1C150C; border-bottom: 2px solid #F1ECE1; padding-bottom: 8px;">
                👤 Customer Information
              </h3>
              <table role="presentation" width="100%" style="font-size: 13px; color: #594D3B; line-height: 1.6; margin-bottom: 20px;">
                <tr>
                  <td width="30%"><strong>Name:</strong></td>
                  <td>${props.customerName}</td>
                </tr>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td><a href="mailto:${props.customerEmail}" style="color: #D84315; text-decoration: none;">${props.customerEmail}</a></td>
                </tr>
                <tr>
                  <td><strong>Shipping Address:</strong></td>
                  <td>
                    ${props.shippingAddress.line1}${props.shippingAddress.line2 ? `, ${props.shippingAddress.line2}` : ""}, 
                    ${props.shippingAddress.city}, ${props.shippingAddress.state} - <strong>${props.shippingAddress.pincode}</strong>
                  </td>
                </tr>
                <tr>
                  <td><strong>Payment Mode:</strong></td>
                  <td>${props.paymentReference ? `Online Razorpay (${props.paymentReference})` : "Cash on Delivery (COD)"}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1C150C; border-bottom: 2px solid #F1ECE1; padding-bottom: 8px;">
                📦 Order Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                ${itemsList}
              </table>

              <div style="background-color: #FAF6EE; border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: right;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #786C5E;">Grand Total:</p>
                <p style="margin: 0; font-size: 22px; font-weight: 800; color: #D84315;">₹${Number(props.grandTotal).toFixed(2)}</p>
              </div>

              <div style="text-align: center;">
                <a href="${APP_URL}/admin/orders/${props.orderNumber}" style="display: inline-block; background-color: #1C150C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  Open Order in Admin Panel →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6EE; padding: 14px; text-align: center; border-top: 1px solid #EFE8DA; font-size: 11px; color: #8A7B6B;">
              Makhana Gold Automated Store Notification Engine
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}


