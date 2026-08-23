"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireCustomerId() {
  const session = await auth();
  const id = session?.user?.id ? Number(session.user.id) : null;
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function addAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const isDefault = formData.get("isDefault") === "on" || formData.get("isDefault") === "true";

  // If this is the first address or marked default, reset other addresses
  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId },
      data: { isDefaultShipping: false, isDefaultBilling: false },
    });
  }

  const existingCount = await prisma.address.count({ where: { customerId } });

  await prisma.address.create({
    data: {
      customerId,
      label: String(formData.get("label") || "Home"),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || "") || null,
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      pincode: String(formData.get("pincode") || ""),
      isDefaultShipping: isDefault || existingCount === 0,
      isDefaultBilling: isDefault || existingCount === 0,
    },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const id = Number(formData.get("addressId"));

  // Reset all addresses to non-default
  await prisma.address.updateMany({
    where: { customerId },
    data: { isDefaultShipping: false, isDefaultBilling: false },
  });

  // Mark selected address as default
  await prisma.address.update({
    where: { id, customerId },
    data: { isDefaultShipping: true, isDefaultBilling: true },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function deleteAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const id = Number(formData.get("addressId"));
  await prisma.address.delete({ where: { id, customerId } });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
