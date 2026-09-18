import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPlaceholderEmail } from "@/lib/phone-email";
import { redirect } from "next/navigation";
import { AccountSidebarClient } from "./AccountSidebarClient";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const customerId = Number(session.user.id);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { name: true, email: true, phone: true },
  });

  const userName = customer?.name || session.user.name || "Valued Member";

  // If user signed up via phone OTP and has synthetic placeholder email, display their clean phone number
  const cleanPhone = customer?.phone ? customer.phone.replace(/\D/g, "").slice(-10) : "";
  const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : "";

  const userDisplayIdentifier = isPlaceholderEmail(customer?.email)
    ? formattedPhone || "Mobile Verified Member"
    : (customer?.email || session.user.email || "");

  return (
    <div className="max-w-container-max mx-auto px-gutter py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <AccountSidebarClient userName={userName} userEmail={userDisplayIdentifier} />
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
