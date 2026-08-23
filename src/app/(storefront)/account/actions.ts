"use server";

import { signOut } from "@/lib/auth";

export async function customerLogoutAction() {
  await signOut({ redirectTo: "/login" });
}
