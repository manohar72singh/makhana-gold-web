"use server";

import { prisma } from "@/lib/db";
import { sendInquiryAcknowledgementEmail } from "@/lib/email";
import { notifyAdmins } from "@/lib/admin-notifications";

export async function submitContactInquiryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim() || null;
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!email || !message) {
    return { success: false, error: "Please provide both an email and a message." };
  }

  try {
    // 1. Persist to Database with Enterprise Status Tracking
    await prisma.contactInquiry.create({
      data: {
        name: name || "Valued Customer",
        email,
        phone,
        subject: subject || "General Inquiry",
        message,
        status: "new",
      },
    });

    // 2. Dispatch Confirmation Email & Admin Alert
    try {
      await sendInquiryAcknowledgementEmail({
        customerName: name || "Valued Customer",
        email,
        phone,
        subject: subject || "Customer Care Inquiry",
        message,
      });
    } catch (emailErr) {
      console.error("Email dispatch notice (inquiry saved to DB):", emailErr);
    }

    await notifyAdmins({
      type: "new_inquiry",
      title: `New support inquiry — ${subject || "General Inquiry"}`,
      message: `${name || "Valued Customer"} (${email})`,
      link: "/admin/inquiries",
    });

    return { success: true };
  } catch (error) {
    console.error("Support inquiry persistence error:", error);
    return { success: false, error: "Failed to submit inquiry. Please try again." };
  }
}
