import { prisma } from "@/lib/db";

export type AdminNotificationType = "new_order" | "new_inquiry" | "new_review" | "payment_failed";

export async function notifyAdmins({
  type,
  title,
  message,
  link,
}: {
  type: AdminNotificationType;
  title: string;
  message?: string;
  link?: string;
}) {
  try {
    await prisma.adminNotification.create({ data: { type, title, message, link } });
  } catch (err) {
    console.error("Failed to create admin notification:", err);
  }
}
