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
  const phone = (formData.get("phone") as string)?.trim();

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: name || null,
      phone: phone || null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
}
