"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { adminAuth } from "@/lib/auth-admin";

export async function changeAdminPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await adminAuth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const { currentPassword, newPassword, confirmPassword } = input;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required." };
  }
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation do not match." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: Number(session.user.id) } });
  if (!admin) {
    return { success: false, error: "Admin account not found." };
  }

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
