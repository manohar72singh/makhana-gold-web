"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { adminSignIn, adminSignOut } from "@/lib/auth-admin";

export async function adminLoginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin/dashboard";

  try {
    await adminSignIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=CredentialsSignin`);
    }
    throw error; // re-throw NEXT_REDIRECT (successful sign-in) so Next.js can handle it
  }
}

export async function adminLogoutAction() {
  await adminSignOut({ redirectTo: "/admin/login" });
}
