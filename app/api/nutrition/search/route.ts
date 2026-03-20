import { NextRequest, NextResponse } from "next/server";
import { searchFoods } from "@/lib/api/fatsecret";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "0", 10);

  if (!q || q.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  try {
    const foods = await searchFoods(q, page);
    return NextResponse.json({ foods });
  } catch (err) {
    console.error("FatSecret search error:", err);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
