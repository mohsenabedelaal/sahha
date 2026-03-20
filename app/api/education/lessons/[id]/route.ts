import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { educationContent, userEducationProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { awardXp } from "@/lib/gamification-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [lesson] = await db
    .select()
    .from(educationContent)
    .where(eq(educationContent.id, Number(id)))
    .limit(1);

  if (!lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ lesson });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(session.user.id);
  const lessonId = Number(id);

  // Check if already completed
  const [existing] = await db
    .select()
    .from(userEducationProgress)
    .where(
      and(
        eq(userEducationProgress.user_id, userId),
        eq(userEducationProgress.education_content_id, lessonId)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ message: "Already completed" });
  }

  await db.insert(userEducationProgress).values({
    user_id: userId,
    education_content_id: lessonId,
  });

  const xpResult = await awardXp(userId, "education");

  return NextResponse.json({ completed: true, xp: xpResult });
}
