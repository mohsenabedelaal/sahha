import { NextRequest, NextResponse } from "next/server";
import { findByBarcode } from "@/lib/api/fatsecret";

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get("barcode")?.trim();

  if (!barcode) {
    return NextResponse.json({ error: "barcode parameter required" }, { status: 400 });
  }

  try {
    const food = await findByBarcode(barcode);
    if (!food) {
      return NextResponse.json({ error: "Food not found for barcode" }, { status: 404 });
    }
    return NextResponse.json({ food });
  } catch (err) {
    console.error("Barcode lookup error:", err);
    return NextResponse.json({ error: "Barcode lookup failed" }, { status: 500 });
  }
}
