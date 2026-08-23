import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { WhatsAppConcierge } from "@/components/storefront/WhatsAppConcierge";
import { getSiteSettings } from "@/lib/content";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const whatsappNumber = settings["support_whatsapp"] || "916001684216";
  const storeName = settings["store_name"] || "Makhana Gold";

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <WhatsAppConcierge whatsappNumber={whatsappNumber} storeName={storeName} />
      <SiteFooter />
    </>
  );
}
