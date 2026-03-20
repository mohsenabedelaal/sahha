import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseNaturalLanguage } from "@/lib/api/edamam";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { text } = body as { text: string };

  if (!text || text.trim().length < 2) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const foods = await parseNaturalLanguage(text);
  return NextResponse.json({ foods });
}
