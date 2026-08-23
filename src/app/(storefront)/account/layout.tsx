import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountSidebarClient } from "./AccountSidebarClient";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const userName = session.user.name || "Valued Member";
  const userEmail = session.user.email || "";

  return (
    <div className="max-w-container-max mx-auto px-gutter py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <AccountSidebarClient userName={userName} userEmail={userEmail} />
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
