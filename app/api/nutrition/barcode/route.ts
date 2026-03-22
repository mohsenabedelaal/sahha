import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { lookupBarcodeOFF } from "@/lib/api/openfoodfacts";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    const food = await lookupBarcodeOFF(code);
    if (!food) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({ found: true, food });
  } catch (err) {
    console.error("Barcode lookup error:", err);
    return NextResponse.json({ found: false });
  }
}
