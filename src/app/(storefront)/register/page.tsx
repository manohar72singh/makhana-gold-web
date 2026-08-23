import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/account";
  redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
