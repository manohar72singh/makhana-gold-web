import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginFormClient } from "./LoginFormClient";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/account";

  const session = await auth();
  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-4 md:py-6 bg-[#FAF6EE]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-900/10 p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-block mb-2 hover:scale-102 transition-transform">
            <div className="relative w-36 h-12 mx-auto">
              <Image
                src="/images/logo/logo.png"
                alt="Makhana Gold"
                fill
                priority
                sizes="144px"
                className="object-contain"
              />
            </div>
          </Link>

          <h1 className="font-display-lg text-xl font-bold text-on-surface mb-0.5">
            Welcome to Makhana Gold
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Sign in to access your orders, saved addresses & privileges.
          </p>
        </div>

        {/* Interactive Compact Client Form */}
        <LoginFormClient error={error} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
