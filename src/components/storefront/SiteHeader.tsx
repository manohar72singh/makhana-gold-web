import { getCartItemCount } from "@/lib/cart";
import { auth } from "@/lib/auth";
import { getSiteSettings, getCategoryTree } from "@/lib/content";
import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  let cartCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;
  let settings: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categoryTree: any[] = [];

  try {
    const results = await Promise.all([
      getCartItemCount().catch(() => 0),
      auth().catch(() => null),
      getSiteSettings().catch(() => ({})),
      getCategoryTree().catch(() => []),
    ]);
    cartCount = results[0];
    session = results[1];
    settings = results[2];
    categoryTree = results[3];
  } catch (err) {
    console.error("Error loading header data:", err);
  }


  const isAnnouncementEnabled = settings["announcement_enabled"] !== "false";
  const badgeText = settings["announcement_badge"] || "Special Privilege:";
  const announcementText = settings["announcement_text"] || "Get 15% OFF your first harvest";
  const couponCode = settings["announcement_coupon"] || "GOLDEN15";
  const shippingNotice = settings["announcement_shipping_text"] || "🚚 Free Shipping on Orders ₹500+";

  return (
    <>
      {/* Eye-catching Royal Announcement Bar (100% Admin Dynamic) */}
      {isAnnouncementEnabled && (
        <div className="bg-gradient-to-r from-[#2B1B04] via-[#3D2906] to-[#2B1B04] text-amber-100 py-2.5 px-4 text-center text-xs sm:text-sm font-medium border-b border-amber-500/30 relative overflow-hidden shadow-xs">
          <div className="max-w-container-max mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {badgeText && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {badgeText}
              </span>
            )}
            <span>{announcementText}</span>
            {couponCode && (
              <>
                <span className="hidden sm:inline text-white/30">•</span>
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold tracking-wider">
                  {couponCode}
                </span>
              </>
            )}
            {shippingNotice && (
              <>
                <span className="hidden md:inline text-white/30">•</span>
                <span className="hidden md:inline text-amber-200/80">{shippingNotice}</span>
              </>
            )}
          </div>
        </div>
      )}

      <SiteHeaderClient
        cartCount={cartCount}
        isLoggedIn={Boolean(session?.user?.id)}
        userName={session?.user?.name || null}
        categoryTree={categoryTree}
      />
    </>
  );
}
