import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { WhatsAppConcierge } from "@/components/storefront/WhatsAppConcierge";
import { getSiteSettings } from "@/lib/content";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  let whatsappNumber = "916001684216";
  let storeName = "Makhana Gold";

  try {
    const settings = await getSiteSettings();
    whatsappNumber = settings["support_whatsapp"] || "916001684216";
    storeName = settings["store_name"] || "Makhana Gold";
  } catch (error) {
    console.error("Error loading site settings in StorefrontLayout:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <WhatsAppConcierge whatsappNumber={whatsappNumber} storeName={storeName} />
      <SiteFooter />
    </>
  );
}

