import type { Metadata } from "next";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { WebsiteQrStudioClient } from "./WebsiteQrStudioClient";
import { WebsiteQrSettings } from "./actions";

export const metadata: Metadata = {
  title: "Website Packaging QR Studio | Makhana Gold Admin",
  description: "Official permanent packaging QR code studio for product pouches and cartons.",
};

export default async function WebsiteQrPage() {
  const settingsRecords = await prisma.siteSetting.findMany({});
  const settings: Record<string, string> = {};
  for (const s of settingsRecords) {
    settings[s.key] = s.value;
  }

  const targetUrl = settings["website_qr_target_url"] || "https://makhanagold.com";
  const headline = settings["website_qr_headline"] || "Scan to Discover Pure Makhana Heritage";
  const tagline = settings["website_qr_tagline"] || "Lab Tested • FSSAI & ISO Certified • 100% Traceable";
  const colorDark = settings["website_qr_color"] || "#160E08";
  let pngDataUrl = settings["website_qr_png"] || "";
  let svgData = settings["website_qr_svg"] || "";
  let generatedAt = settings["website_qr_generated_at"] || "";

  // Auto-generate and save initial QR if not yet saved in database
  if (!pngDataUrl || !svgData) {
    try {
      pngDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 1200,
        margin: 2,
        color: { dark: colorDark, light: "#FFFFFF" },
        errorCorrectionLevel: "H",
      });

      svgData = await QRCode.toString(targetUrl, {
        type: "svg",
        margin: 2,
        color: { dark: colorDark, light: "#FFFFFF" },
        errorCorrectionLevel: "H",
      });

      generatedAt = new Date().toISOString();

      await Promise.all([
        prisma.siteSetting.upsert({
          where: { key: "website_qr_target_url" },
          update: { value: targetUrl },
          create: { key: "website_qr_target_url", value: targetUrl },
        }),
        prisma.siteSetting.upsert({
          where: { key: "website_qr_png" },
          update: { value: pngDataUrl },
          create: { key: "website_qr_png", value: pngDataUrl },
        }),
        prisma.siteSetting.upsert({
          where: { key: "website_qr_svg" },
          update: { value: svgData },
          create: { key: "website_qr_svg", value: svgData },
        }),
        prisma.siteSetting.upsert({
          where: { key: "website_qr_generated_at" },
          update: { value: generatedAt },
          create: { key: "website_qr_generated_at", value: generatedAt },
        }),
      ]);
    } catch (err) {
      console.error("[website-qr] Error generating initial QR:", err);
    }
  }

  const initialSettings: WebsiteQrSettings = {
    targetUrl,
    headline,
    tagline,
    colorDark,
    pngDataUrl,
    svgData,
    generatedAt,
    fssaiNumber: settings["fssai_license"] || "12726052000575",
    isoText: settings["iso_certified_text"] || "ISO 22000 & 9001 Certified",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <WebsiteQrStudioClient initialSettings={initialSettings} />
    </div>
  );
}
