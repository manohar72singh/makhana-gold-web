import { NextRequest, NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/shiprocket";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode") || "";
    const weight = Number(searchParams.get("weight") || "0.5");
    const cod = searchParams.get("cod") === "1" || searchParams.get("cod") === "true";

    const cleaned = pincode.replace(/[^0-9]/g, "");

    if (!/^\d{6}$/.test(cleaned)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 6-digit Indian PIN code.",
        },
        { status: 400 }
      );
    }

    const result = await checkPincodeServiceability({
      deliveryPincode: cleaned,
      weightKg: weight,
      isCod: cod,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Serviceability route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check serviceability.",
      },
      { status: 500 }
    );
  }
}
