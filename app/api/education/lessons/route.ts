import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { educationContent, userEducationProgress, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [user] = await db
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const lessons = await db
    .select()
    .from(educationContent)
    .orderBy(educationContent.order_index);

  const progress = await db
    .select({ education_content_id: userEducationProgress.education_content_id })
    .from(userEducationProgress)
    .where(eq(userEducationProgress.user_id, userId));

  const completedIds = new Set(progress.map((p) => p.education_content_id));
  const userLevel = user?.level || 1;

  // Unlock rules: beginner = level 1+, intermediate = level 5+, advanced = level 15+
  const levelRequirements: Record<string, number> = {
    beginner: 1,
    intermediate: 5,
    advanced: 15,
  };

  const result = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    category: lesson.category,
    difficulty_level: lesson.difficulty_level,
    xp_reward: lesson.xp_reward,
    completed: completedIds.has(lesson.id),
    locked: userLevel < (levelRequirements[lesson.difficulty_level] || 1),
    required_level: levelRequirements[lesson.difficulty_level] || 1,
  }));

  return NextResponse.json({ lessons: result });
}
