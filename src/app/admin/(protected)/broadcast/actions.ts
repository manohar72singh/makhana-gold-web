"use server";

import { prisma } from "@/lib/db";
import { adminAuth } from "@/lib/auth-admin";
import { sendBroadcastEmailBatch } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendBroadcastAction(formData: FormData) {
  const session = await adminAuth();
  const adminName = session?.user?.name || session?.user?.email || "Admin";

  const audience = (formData.get("audience") as string) || "all_customers";
  const targetEmail = (formData.get("targetEmail") as string)?.trim().toLowerCase();
  const subject = (formData.get("subject") as string)?.trim() || "Important Announcement from Makhana Gold";
  const badge = (formData.get("badge") as string)?.trim() || null;
  const headline = (formData.get("headline") as string)?.trim() || "Artisanal Harvest Update";
  const message = (formData.get("message") as string)?.trim() || "";
  const couponCode = (formData.get("couponCode") as string)?.trim().toUpperCase() || null;
  const ctaText = (formData.get("ctaText") as string)?.trim() || null;
  const ctaUrl = (formData.get("ctaUrl") as string)?.trim() || null;
  const bannerImageUrl = (formData.get("bannerImageUrl") as string)?.trim() || null;

  if (!subject || !headline || !message) {
    throw new Error("Subject, headline, and message body are required.");
  }

  // 1. Gather Recipients
  const recipientsMap = new Map<string, { email: string; name?: string | null }>();

  if (audience === "individual") {
    if (!targetEmail || !targetEmail.includes("@")) {
      throw new Error("Please enter a valid recipient email address.");
    }
    const customer = await prisma.customer.findUnique({ where: { email: targetEmail } });
    recipientsMap.set(targetEmail, {
      email: targetEmail,
      name: customer?.name || "Valued Foodie",
    });
  } else if (audience === "all_customers") {
    const customers = await prisma.customer.findMany({
      select: { email: true, name: true },
    });
    for (const c of customers) {
      if (c.email) {
        recipientsMap.set(c.email.toLowerCase(), { email: c.email, name: c.name });
      }
    }
  } else if (audience === "all_subscribers") {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "active" },
      select: { email: true },
    });
    for (const s of subscribers) {
      if (s.email) {
        recipientsMap.set(s.email.toLowerCase(), { email: s.email, name: "Conscious Foodie" });
      }
    }
  } else if (audience === "entire_community") {
    const [customers, subscribers] = await Promise.all([
      prisma.customer.findMany({ select: { email: true, name: true } }),
      prisma.newsletterSubscriber.findMany({ where: { status: "active" }, select: { email: true } }),
    ]);

    for (const c of customers) {
      if (c.email) {
        recipientsMap.set(c.email.toLowerCase(), { email: c.email, name: c.name });
      }
    }

    for (const s of subscribers) {
      if (s.email && !recipientsMap.has(s.email.toLowerCase())) {
        recipientsMap.set(s.email.toLowerCase(), { email: s.email, name: "Conscious Foodie" });
      }
    }
  }

  const recipients = Array.from(recipientsMap.values());

  if (recipients.length === 0) {
    throw new Error("No recipients found for the selected audience segment.");
  }

  // 2. Dispatch Emails
  const result = await sendBroadcastEmailBatch({
    recipients,
    subject,
    badge,
    headline,
    message,
    couponCode,
    ctaText,
    ctaUrl,
    bannerImageUrl,
  });

  // 3. Log to Database History
  await prisma.broadcastLog.create({
    data: {
      subject,
      badge,
      headline,
      message,
      couponCode,
      ctaText,
      ctaUrl,
      bannerImageUrl,
      audience,
      targetEmail: audience === "individual" ? targetEmail : null,
      recipientCount: result.total,
      sentByAdmin: adminName,
      status: result.failCount === result.total && result.total > 0 ? "failed" : "sent",
    },
  });

  revalidatePath("/admin/broadcast");
  return {
    success: true,
    recipientCount: result.total,
    successCount: result.successCount,
  };
}

export async function deleteBroadcastLogAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.broadcastLog.delete({ where: { id } });
    revalidatePath("/admin/broadcast");
  }
}
