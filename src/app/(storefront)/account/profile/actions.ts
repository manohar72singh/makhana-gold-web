"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const customerId = Number(session.user.id);
  const name = (formData.get("name") as string)?.trim();
  const rawPhone = (formData.get("phone") as string)?.trim();
  let normalizedPhone: string | null = null;
  if (rawPhone) {
    const clean = rawPhone.replace(/\D/g, "").slice(-10);
    if (clean.length === 10) {
      normalizedPhone = `+91${clean}`;
    } else {
      normalizedPhone = rawPhone;
    }

    const existingPhoneCustomer = await prisma.customer.findFirst({
      where: {
        id: { not: customerId },
        OR: [
          { phone: normalizedPhone },
          { phone: clean },
          { phone: { contains: clean } },
        ],
      },
      select: { id: true },
    });

    if (existingPhoneCustomer) {
      throw new Error("This phone number is already registered to another account.");
    }
  }

  const companyName = (formData.get("companyName") as string)?.trim() || null;
  const rawGstin = (formData.get("gstin") as string)?.toUpperCase().trim().replace(/[^A-Z0-9]/g, "") || null;
  const isB2b = Boolean(formData.get("isB2b") === "on" || (companyName && rawGstin));

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: name || null,
      phone: normalizedPhone,
      isB2b,
      companyName,
      gstin: rawGstin,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
}
