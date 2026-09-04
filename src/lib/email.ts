import nodemailer from "nodemailer";
import {
  generateOrderConfirmationEmailHtml,
  generateAdminNewOrderAlertHtml,
  generateNewsletterWelcomeEmailHtml,
  generateInquiryAcknowledgementEmailHtml,
  generateBroadcastEmailHtml,
  OrderEmailProps,
} from "./email-templates";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export function isEmailConfigured(): boolean {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  const hasSmtp = Boolean(smtpUser && smtpPass && !smtpPass.includes("placeholder"));
  const hasResend = Boolean(resendKey && !resendKey.includes("placeholder"));

  return hasSmtp || hasResend;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const fromEmail = process.env.EMAIL_FROM || (smtpUser ? `Makhana Gold <${smtpUser}>` : "Makhana Gold <orders@makhanagold.com>");
  const resendKey = process.env.RESEND_API_KEY;

  // 1. Prioritize Direct SMTP (Gmail / Custom Domain Webmail)
  if (smtpUser && smtpPass && !smtpPass.includes("placeholder")) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      return { success: true, id: info.messageId };
    } catch (error: any) {
      console.error("SMTP Email Dispatch Error:", error?.message || error);
      return { success: false, error: error?.message || error };
    }
  }

  // 2. Resend API Fallback
  if (resendKey && !resendKey.includes("placeholder")) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend API Error:", errText);
        return { success: false, error: errText };
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return { success: false, error };
    }
  }

  // 3. Graceful Development & Testing Logger
  console.log(`[EMAIL DISPATCH SIMULATION]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Status: Successfully queued in development logger`);

  return { success: true, simulated: true };
}

export async function sendOrderConfirmationEmail(props: OrderEmailProps) {
  // 1. Send Royal Invoice to Customer
  const customerHtml = generateOrderConfirmationEmailHtml(props);
  const customerRes = await sendEmail({
    to: props.customerEmail,
    subject: `Order Confirmed: #${props.orderNumber} — Makhana Gold Artisanal Harvest`,
    html: customerHtml,
  });

  // 2. Send Instant Alert to Admin (mmakhanaltd@gmail.com)
  const adminEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "mmakhanaltd@gmail.com";
  try {
    const adminHtml = generateAdminNewOrderAlertHtml(props);
    await sendEmail({
      to: adminEmail,
      subject: `🚨 [New Order #${props.orderNumber}] ₹${Number(props.grandTotal).toFixed(0)} from ${props.customerName}`,
      html: adminHtml,
    });
  } catch (err) {
    console.error("Failed to send admin order alert email:", err);
  }

  return customerRes;
}

export async function sendNewsletterWelcomeEmail(email: string, promoCode = "GOLDEN15") {
  const html = generateNewsletterWelcomeEmailHtml(email, promoCode);
  return sendEmail({
    to: email,
    subject: "Welcome to The Gold Standard Society — Your 15% Privilege Inside ✨",
    html,
  });
}

export async function sendInquiryAcknowledgementEmail({
  customerName,
  email,
  phone,
  subject,
  message,
}: {
  customerName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  const ticketNumber = `MG-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const html = generateInquiryAcknowledgementEmailHtml({
    customerName,
    email,
    subject,
    message,
    ticketNumber,
  });

  // 1. Send acknowledgement to customer
  const customerRes = await sendEmail({
    to: email,
    subject: `[Ticket #${ticketNumber}] We've Received Your Inquiry — Makhana Gold Concierge`,
    html,
  });

  // 2. Send instant alert to Admin (mmakhanaltd@gmail.com)
  const adminEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "mmakhanaltd@gmail.com";
  try {
    const adminAlertHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e0d7c6;">
        <h2 style="color: #D84315; margin-top: 0;">📩 New Customer Inquiry Received</h2>
        <p style="font-size: 14px; color: #555;"><strong>Ticket:</strong> #${ticketNumber}</p>
        <p style="font-size: 14px; color: #333;"><strong>Customer Name:</strong> ${customerName}</p>
        <p style="font-size: 14px; color: #333;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p style="font-size: 14px; color: #333;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ""}
        <p style="font-size: 14px; color: #333;"><strong>Subject:</strong> ${subject}</p>
        <div style="background: #FAF8F5; padding: 16px; border-radius: 8px; border-left: 4px solid #D84315; margin-top: 16px;">
          <p style="margin: 0; font-size: 14px; color: #222; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
          Reply directly to <a href="mailto:${email}">${email}</a> or view tickets in your Admin Studio.
        </p>
      </div>
    `;
    await sendEmail({
      to: adminEmail,
      subject: `🚨 [Inquiry #${ticketNumber}] ${subject} from ${customerName}`,
      html: adminAlertHtml,
    });
  } catch (err) {
    console.error("Failed to send admin inquiry notification:", err);
  }

  return customerRes;
}

export async function sendBroadcastEmailBatch({
  recipients,
  subject,
  badge,
  headline,
  message,
  couponCode,
  ctaText,
  ctaUrl,
  bannerImageUrl,
}: {
  recipients: Array<{ email: string; name?: string | null }>;
  subject: string;
  badge?: string | null;
  headline: string;
  message: string;
  couponCode?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  bannerImageUrl?: string | null;
}) {
  let successCount = 0;
  let failCount = 0;

  for (const r of recipients) {
    const html = generateBroadcastEmailHtml({
      recipientName: r.name || "Valued Customer",
      badge,
      headline,
      message,
      couponCode,
      ctaText,
      ctaUrl,
      bannerImageUrl,
    });

    const res = await sendEmail({
      to: r.email,
      subject,
      html,
    });

    if (res.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  return { successCount, failCount, total: recipients.length };
}

export async function sendOtpEmail({
  to,
  code,
  customerName,
}: {
  to: string;
  code: string;
  customerName?: string | null;
}) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #EFE8DA; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #241607 0%, #150D04 100%); padding: 28px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; color: #F5E6CC; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">Makhana Gold</h1>
      </div>
      <div style="padding: 32px 28px; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #1C150C;">Namaste${customerName ? ` ${customerName}` : ""},</p>
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #6D5F4D; line-height: 1.6;">
          Use the code below to verify this email address for your Makhana Gold account. It expires in 10 minutes.
        </p>
        <div style="display: inline-block; background: #FAF6EE; border: 2px dashed #D4AF37; border-radius: 14px; padding: 16px 32px; font-family: monospace; font-size: 32px; font-weight: 800; color: #D84315; letter-spacing: 8px;">
          ${code}
        </div>
        <p style="margin: 24px 0 0 0; font-size: 11px; color: #8A7B6B;">
          Didn't request this? You can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `${code} is your Makhana Gold verification code`,
    html,
  });
}

export async function sendShippingDispatchEmail({
  to,
  customerName,
  orderNumber,
  courierPartner,
  trackingNumber,
  trackingUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  courierPartner: string;
  trackingNumber: string;
  trackingUrl: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6EE; padding: 28px; border-radius: 16px; border: 1px solid #EAE0D0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; background: #D84315; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 12px; rounded: 20px; text-transform: uppercase; letter-spacing: 1px; border-radius: 20px;">
          🚚 Dispatched &amp; In Transit
        </span>
        <h2 style="color: #1C150C; font-size: 22px; margin: 12px 0 4px 0;">Your Order is On Its Way!</h2>
        <p style="font-size: 13px; color: #786C5E; margin: 0;">Order #${orderNumber}</p>
      </div>

      <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #E0D7C6; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Namaste <strong>${customerName}</strong>,</p>
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px 0;">
          Great news! Your fresh batch of slow-roasted Makhana Gold has been packaged and handed over to our logistics partner for expedited delivery.
        </p>

        <div style="background: #FAF6EE; padding: 14px; border-radius: 8px; border-left: 4px solid #D84315;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;"><strong>Courier Partner:</strong> ${courierPartner}</p>
          <p style="margin: 0; font-size: 12px; color: #666;"><strong>AWB Tracking Number:</strong> <span style="font-family: monospace; font-weight: bold; color: #D84315;">${trackingNumber}</span></p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${trackingUrl}" style="display: inline-block; background: #D84315; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
          📍 Live Track Your Package ↗
        </a>
      </div>

      <p style="font-size: 11px; text-align: center; color: #888; margin: 0;">
        Need help with delivery? WhatsApp our direct desk at <a href="https://wa.me/916001684216" style="color: #D84315; font-weight: bold;">+91 60016 84216</a>.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🚚 Dispatched: Makhana Gold Order #${orderNumber} via ${courierPartner}`,
    html,
  });
}


