import QRCode from "qrcode";
// @ts-ignore
import bwipjs from "bwip-js";

/**
 * Generate standard retail Barcode (EAN-13 or Code128) as a Base64 PNG Data URL
 */
export async function generateBarcodeDataUrl(
  text: string,
  bcid: "ean13" | "code128" = "ean13"
): Promise<string> {
  try {
    let cleanText = text.trim();

    // If EAN-13, ensure valid 12 or 13 digits format (pad if needed)
    if (bcid === "ean13") {
      cleanText = cleanText.replace(/[^0-9]/g, "");
      if (cleanText.length < 12) {
        cleanText = (cleanText + "000000000000").slice(0, 12);
      } else if (cleanText.length > 13) {
        cleanText = cleanText.slice(0, 13);
      }
    }

    const pngBuffer = await bwipjs.toBuffer({
      bcid: bcid === "ean13" && cleanText.length < 12 ? "code128" : bcid,
      text: cleanText,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
    });

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch (error) {
    // Fallback to Code128 if EAN checksum fails
    try {
      const pngBuffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: text || "MG890191136689",
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: "center",
        backgroundcolor: "FFFFFF",
      });
      return `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
      console.error("Barcode generation error:", err);
      return "";
    }
  }
}

/**
 * Generate Smart Packaging QR Code as high-res PNG Data URL
 */
export async function generateQrCodeDataUrl(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#1C150C", // Royal Makhana Gold dark brown/black
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error tolerance for packaging print
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return "";
  }
}
