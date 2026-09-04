import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPlaceholderEmail } from "@/lib/phone-email";
import { updateCustomerProfileAction } from "./actions";
import { EmailVerificationClient } from "./EmailVerificationClient";

export default async function CustomerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const customerId = Number(session!.user.id);
  const callbackUrl = typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      _count: {
        select: {
          orders: true,
          addresses: true,
          wishlists: true,
        },
      },
    },
  });

  if (!customer) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-amber-900/10 pb-4">
        <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-amber-700 block mb-1">
          Account Settings
        </span>
        <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
          My Personal Profile
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Manage your personal details, phone number, and account information.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-ambient border border-amber-900/10">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-amber-900/10">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-800 font-bold text-2xl uppercase shrink-0">
            {customer.name?.charAt(0) || customer.email.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                {customer.name || "Makhana Gold Member"}
              </h2>
              <span className="bg-amber-500/15 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-amber-500/30">
                Gold Club
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {isPlaceholderEmail(customer.email) ? customer.phone || "No email verified yet" : customer.email}
            </p>
            <p className="text-[11px] text-amber-800/70 mt-1">
              Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="space-y-5 max-w-xl">
          {/* Email — its own mini-form (send/verify code), kept outside the
              profile-details form below since HTML forms cannot nest. */}
          <div>
            <label className="block font-label-sm text-xs font-bold text-on-surface mb-1.5">
              Email Address (Account ID)
            </label>
            {isPlaceholderEmail(customer.email) ? (
              <EmailVerificationClient callbackUrl={callbackUrl} />
            ) : (
              <>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={customer.email}
                    className="w-full bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Your email is permanently linked to your order history and invoices.
                </p>
              </>
            )}
          </div>

          {/* Profile Update Form */}
          <form action={updateCustomerProfileAction} className="space-y-5">
            <div>
              <label htmlFor="name" className="block font-label-sm text-xs font-bold text-on-surface mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={customer.name || ""}
                placeholder="e.g. Ramesh Sharma"
                className="w-full bg-[#FAF6EE] rounded-2xl border border-amber-900/15 px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-label-sm text-xs font-bold text-on-surface mb-1.5">
                Phone Number (For Delivery Updates)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer.phone || ""}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#FAF6EE] rounded-2xl border border-amber-900/15 px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-8 py-3.5 rounded-2xl font-label-md text-xs uppercase tracking-widest transition-all shadow-vermillion-glow inline-flex items-center gap-2 font-bold cursor-pointer active:scale-98"
              >
                <span>Save Profile Changes</span>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-ambient border border-amber-900/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <div>
            <p className="font-headline-sm text-xl font-bold text-on-surface">
              {customer._count.orders}
            </p>
            <p className="text-xs text-on-surface-variant">Lifetime Orders</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-ambient border border-amber-900/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">home_pin</span>
          </div>
          <div>
            <p className="font-headline-sm text-xl font-bold text-on-surface">
              {customer._count.addresses}
            </p>
            <p className="text-xs text-on-surface-variant">Saved Addresses</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-ambient border border-amber-900/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">favorite</span>
          </div>
          <div>
            <p className="font-headline-sm text-xl font-bold text-on-surface">
              {customer._count.wishlists}
            </p>
            <p className="text-xs text-on-surface-variant">Wishlisted Flavours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
