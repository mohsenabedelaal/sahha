import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { lookupBarcode as fatsecretLookup } from "@/lib/api/fatsecret";
import { lookupBarcode as offLookup } from "@/lib/api/openfoodfacts";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  // Try FatSecret first, fall back to Open Food Facts
  let food = await fatsecretLookup(code);
  if (!food) {
    food = await offLookup(code);
  }

  if (!food) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, food });
}
