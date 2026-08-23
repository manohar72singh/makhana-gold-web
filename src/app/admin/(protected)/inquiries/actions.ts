"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateInquiryStatusAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const status = String(formData.get("status") || "new");
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!inquiryId) return;

  await prisma.contactInquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      adminNotes: adminNotes || undefined,
      resolvedAt: status === "resolved" ? new Date() : null,
    },
  });

  revalidatePath("/admin/inquiries");
}
