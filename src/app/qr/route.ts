import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Universal Packaging QR Redirection Handler
 * When customers scan the QR on product pouches, this route forwards them
 * directly to the configured website URL with packaging UTM tracking.
 */
export async function GET() {
  let targetUrl = "https://makhanagold.com";

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "website_qr_target_url" },
    });
    if (setting?.value && setting.value.trim().length > 0) {
      targetUrl = setting.value.trim();
    }
  } catch (error) {
    console.error("[qr] Error fetching target URL from site_settings:", error);
  }

  // Ensure absolute protocol
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  // Append packaging source parameters for web analytics
  const separator = targetUrl.includes("?") ? "&" : "?";
  const redirectUrl = `${targetUrl}${separator}utm_source=packaging_qr&utm_medium=pouch_scan&utm_campaign=product_packaging`;

  return NextResponse.redirect(redirectUrl, 307);
}
