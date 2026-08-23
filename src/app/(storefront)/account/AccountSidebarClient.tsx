"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogoutAction } from "./actions";

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: "dashboard" },
  { href: "/account/profile", label: "My Profile", icon: "person" },
  { href: "/account/orders", label: "Order History", icon: "package_2" },
  { href: "/account/wishlist", label: "My Wishlist", icon: "favorite" },
  { href: "/account/addresses", label: "Saved Addresses", icon: "home_pin" },
];

export function AccountSidebarClient({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient border border-outline-variant/30 flex flex-col justify-between">
      <div>
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div className="w-14 h-14 rounded-full bg-primary-container/20 border-2 border-primary-container flex items-center justify-center text-primary font-bold text-xl uppercase shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-primary">
              Gold Member
            </span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface truncate">
              {userName}
            </h3>
            <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-row lg:flex-col gap-1.5 pt-6 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-label-md text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action Button */}
      <div className="pt-6 mt-6 border-t border-outline-variant/20">
        <form action={customerLogoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-md text-xs uppercase tracking-wider text-red-700 hover:bg-red-50 hover:text-red-800 transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out / Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}
