import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchFoods } from "@/lib/api/fatsecret";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  try {
    const foods = await searchFoods(query, 15);
    return NextResponse.json({ foods });
  } catch (err) {
    console.error("FatSecret search error:", err);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
