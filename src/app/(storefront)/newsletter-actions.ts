"use server";

import { prisma } from "@/lib/db";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function subscribeNewsletterAction(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    // 1. Upsert into Database (avoids duplicate errors, updates status to active)
    await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: {
        status: "active",
        couponSent: "GOLDEN15",
      },
      create: {
        email: cleanEmail,
        status: "active",
        source: "footer",
        couponSent: "GOLDEN15",
      },
    });

    // 2. Dispatch Welcome Discount Email
    try {
      await sendNewsletterWelcomeEmail(cleanEmail, "GOLDEN15");
    } catch (emailErr) {
      console.error("Newsletter email dispatch notice (subscriber saved to DB):", emailErr);
    }

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}
