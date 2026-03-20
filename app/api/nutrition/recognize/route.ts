import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recognizeFood } from "@/lib/api/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { image, mediaType } = body as { image: string; mediaType?: string };

  if (!image) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  const results = await recognizeFood(
    image,
    (mediaType as "image/jpeg" | "image/png" | "image/webp") || "image/jpeg"
  );

  return NextResponse.json({ foods: results });
}
