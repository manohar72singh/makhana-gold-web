"use server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function submitCorporateInquiryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const quantityRange = String(formData.get("quantityRange") || "50-200 Units");
  const occasion = String(formData.get("occasion") || "Corporate Gifting");
  const customBranding = formData.get("customBranding") === "yes" ? "Yes (Custom Logo/Sleeve Needed)" : "No (Standard Gold Packaging)";
  const eventDate = String(formData.get("eventDate") || "Flexible / Not Fixed");
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !phone) {
    return { success: false, error: "Please provide your Name, Email, and Phone Number." };
  }

  const subject = `[Corporate RFQ] ${companyName ? `${companyName} — ` : ""}${quantityRange} (${occasion})`;

  const formattedInquiry = `
Company / Organization: ${companyName || "N/A"}
Contact Person: ${name}
Phone: ${phone}
Email: ${email}
Required Quantity: ${quantityRange}
Occasion / Purpose: ${occasion}
Custom Branding Required: ${customBranding}
Target Delivery Date: ${eventDate}
Additional Notes / Custom Flavours:
${message || "No additional notes provided."}
  `.trim();

  try {
    // 1. Save to database as a contact inquiry
    await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message: formattedInquiry,
        status: "new",
        adminNotes: `Corporate RFQ Tier: ${quantityRange} | Occasion: ${occasion}`,
      },
    });

    // 2. Dispatch instant alert to Admin (mmakhanaltd@gmail.com)
    const adminEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "mmakhanaltd@gmail.com";
    try {
      const adminHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 16px; border: 1px solid #d4af37; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="background: #1C150C; padding: 16px 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #F5E6CC; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">🎁 New Corporate & Bulk Order RFQ</h2>
          </div>
          <p style="font-size: 14px; color: #333;"><strong>Company:</strong> ${companyName || "Private Buyer"}</p>
          <p style="font-size: 14px; color: #333;"><strong>Contact Name:</strong> ${name}</p>
          <p style="font-size: 14px; color: #333;"><strong>Phone / WhatsApp:</strong> <a href="tel:${phone}" style="color: #D84315; font-weight: bold;">${phone}</a> | <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="color: #25D366; font-weight: bold;">Chat on WhatsApp</a></p>
          <p style="font-size: 14px; color: #333;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="font-size: 14px; color: #333;"><strong>Quantity Range:</strong> <span style="background: #FAF6EE; padding: 3px 8px; border-radius: 6px; font-weight: bold; color: #D84315;">${quantityRange}</span></p>
          <p style="font-size: 14px; color: #333;"><strong>Occasion:</strong> ${occasion}</p>
          <p style="font-size: 14px; color: #333;"><strong>Custom Branding:</strong> ${customBranding}</p>
          <p style="font-size: 14px; color: #333;"><strong>Required By Date:</strong> ${eventDate}</p>

          <div style="background: #FAF8F5; padding: 16px; border-radius: 10px; border-left: 4px solid #D84315; margin-top: 16px;">
            <p style="margin: 0; font-size: 13px; color: #444; white-space: pre-wrap;"><strong>Client Notes:</strong><br>${message || "None"}</p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Namaste%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20reaching%20out%20to%20Makhana%20Gold%20for%20your%20corporate%20bulk%20order..." style="display: inline-block; background: #25D366; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 13px;">
              💬 Quick WhatsApp Reply to Client
            </a>
          </div>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `🚨 [Corporate Bulk Lead] ${quantityRange} for ${companyName || name}`,
        html: adminHtml,
      });

      // 3. Send automated acknowledgement to client
      const clientHtml = `
        <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background: #FAF6EE; padding: 28px; border-radius: 16px; border: 1px solid #EAE0D0;">
          <h2 style="color: #1C150C; font-size: 20px; margin-top: 0;">Namaste ${name},</h2>
          <p style="font-size: 14px; color: #4A3B28; line-height: 1.6;">
            Thank you for choosing <strong>Makhana Gold</strong> for your corporate &amp; bulk superfood requirements. We have received your Request for Quotation (RFQ) for <strong>${quantityRange}</strong>.
          </p>
          <div style="background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #E0D7C6; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #D84315;">What Happens Next?</p>
            <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.5;">
              Our Corporate Concierge team will review your requirements and reach out via WhatsApp/Email within <strong>2 to 4 business hours</strong> with customized tiered pricing, sampling options, and digital hamper mockups.
            </p>
          </div>
          <p style="font-size: 13px; color: #777;">
            For urgent requests, feel free to WhatsApp our direct desk at <a href="https://wa.me/916001684216" style="color: #D84315; font-weight: bold;">+91 60016 84216</a>.
          </p>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: `Makhana Gold Corporate Inquiry Received — Quotation in Progress`,
        html: clientHtml,
      });
    } catch (mailErr) {
      console.error("Corporate mail error:", mailErr);
    }

    return { success: true };
  } catch (error) {
    console.error("Corporate inquiry action error:", error);
    return { success: false, error: "Something went wrong. Please try again or WhatsApp us directly." };
  }
}
