import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addAddressAction, deleteAddressAction, setDefaultAddressAction } from "./actions";
import { AddressFormFields } from "@/components/storefront/AddressFormFields";

export default async function AddressesPage() {
  const session = await auth();
  const customerId = Number(session!.user.id);
  const addresses = await prisma.address.findMany({
    where: { customerId },
    orderBy: [
      { isDefaultShipping: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-amber-900/10 pb-4">
        <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-amber-700 block mb-1">
          Delivery Preferences
        </span>
        <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
          Saved Delivery Addresses ({addresses.length})
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Manage multiple delivery locations for home, workplace, or gifting to friends and family.
        </p>
      </div>

      {/* Saved Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-3xl p-6 shadow-ambient border transition-all flex flex-col justify-between relative ${
              addr.isDefaultShipping
                ? "border-amber-500 ring-2 ring-amber-500/20"
                : "border-amber-900/10 hover:border-amber-500/40"
            }`}
          >
            <div>
              {/* Header: Label & Default Badge */}
              <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 font-label-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
                    <span className="material-symbols-outlined text-[14px]">
                      {addr.label === "Office" ? "apartment" : addr.label === "Home" ? "home" : "location_on"}
                    </span>
                    {addr.label || "Address"}
                  </span>

                  {addr.isDefaultShipping && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Default Address
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={addr.id} />
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                    aria-label="Delete address"
                    title="Delete Address"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </form>
              </div>

              {/* Address Details */}
              <p className="font-body-md text-sm text-on-surface font-semibold mb-1 leading-snug">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
              </p>
              <p className="font-body-md text-xs text-on-surface-variant">
                {addr.city}, {addr.state} — <span className="font-mono font-bold text-[#1C150C]">{addr.pincode}</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">{addr.country}</p>
            </div>

            {/* Set as Default Action (if not already default) */}
            {!addr.isDefaultShipping && (
              <div className="mt-4 pt-3 border-t border-amber-900/10">
                <form action={setDefaultAddressAction}>
                  <input type="hidden" name="addressId" value={addr.id} />
                  <button
                    type="submit"
                    className="text-xs font-bold text-amber-800 hover:text-[#E64A19] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>Set as Default Shipping Address</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-amber-900/10 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-amber-600 mb-2 block">home_pin</span>
            No delivery addresses saved yet. Fill out the form below to add your first address.
          </div>
        )}
      </div>

      {/* Add Address Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-ambient border border-amber-900/10">
        <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-700">add_location_alt</span>
          <span>Add New Delivery Address</span>
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          Save an additional delivery address for seamless 1-click checkout.
        </p>

        <form action={addAddressAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AddressFormFields />

          <div className="md:col-span-2 pt-2 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-on-surface cursor-pointer select-none">
              Make this my primary default delivery address
            </label>
          </div>

          <div className="md:col-span-2 pt-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-8 py-3.5 rounded-2xl font-label-md text-xs uppercase tracking-widest transition-all shadow-vermillion-glow cursor-pointer font-bold inline-flex items-center gap-2"
            >
              <span>Save & Add Address</span>
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
