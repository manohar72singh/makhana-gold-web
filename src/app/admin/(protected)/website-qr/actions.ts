"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export interface WebsiteQrSettings {
  targetUrl: string;
  headline: string;
  tagline: string;
  colorDark: string;
  pngDataUrl: string;
  svgData: string;
  generatedAt: string;
  fssaiNumber: string;
  isoText: string;
}

export async function generateAndSaveWebsiteQrAction(formData: FormData) {
  try {
    const rawTargetUrl = String(formData.get("targetUrl") || "").trim() || "https://makhanagold.com";
    const headline = String(formData.get("headline") || "").trim() || "Scan to Discover Pure Makhana Heritage";
    const tagline = String(formData.get("tagline") || "").trim() || "Lab Tested • FSSAI & ISO Certified • 100% Traceable";
    const colorDark = String(formData.get("colorDark") || "").trim() || "#160E08";

    // Format target URL
    let targetUrl = rawTargetUrl;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    // 1. Generate High-Res PNG (1200x1200px) with High Error Correction (H)
    const pngDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 1200,
      margin: 2,
      color: {
        dark: colorDark,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    // 2. Generate Infinite Vector SVG for Commercial Packaging Printers
    const svgData = await QRCode.toString(targetUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: colorDark,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    const generatedAt = new Date().toISOString();

    // 3. Persist permanently into MySQL site_settings table
    const settingsToSave = [
      { key: "website_qr_target_url", value: targetUrl, description: "Official website packaging QR destination URL" },
      { key: "website_qr_headline", value: headline, description: "Packaging QR banner headline text" },
      { key: "website_qr_tagline", value: tagline, description: "Packaging QR trust tagline text" },
      { key: "website_qr_color", value: colorDark, description: "Packaging QR theme dark color" },
      { key: "website_qr_png", value: pngDataUrl, description: "Generated packaging QR Base64 PNG data URL" },
      { key: "website_qr_svg", value: svgData, description: "Generated packaging QR Vector SVG XML code" },
      { key: "website_qr_generated_at", value: generatedAt, description: "Timestamp when packaging QR was last generated" },
    ];

    for (const item of settingsToSave) {
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value, description: item.description, updatedAt: new Date() },
        create: { key: item.key, value: item.value, description: item.description },
      });
    }

    revalidatePath("/admin/website-qr");

    return {
      success: true as const,
      data: {
        targetUrl,
        headline,
        tagline,
        colorDark,
        pngDataUrl,
        svgData,
        generatedAt,
      },
    };
  } catch (error) {
    console.error("[website-qr] Error generating QR code:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to generate website QR code.",
    };
  }
}
