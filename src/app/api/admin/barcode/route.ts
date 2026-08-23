import { NextRequest, NextResponse } from "next/server";
import { generateBarcodeDataUrl, generateQrCodeDataUrl } from "@/lib/barcode-generator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcodeText = searchParams.get("barcode") || "8901911366891";
  const qrUrl = searchParams.get("qrUrl") || "https://makhanagold.com/shop?source=packet_qr";
  const type = (searchParams.get("type") as "ean13" | "code128") || "ean13";

  const [barcodeDataUrl, qrDataUrl] = await Promise.all([
    generateBarcodeDataUrl(barcodeText, type),
    generateQrCodeDataUrl(qrUrl),
  ]);

  return NextResponse.json({
    success: true,
    barcodeText,
    barcodeDataUrl,
    qrUrl,
    qrDataUrl,
  });
}
