import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { achievements, userAchievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const allAchievements = await db.select().from(achievements);
  const earned = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.user_id, userId));

  const earnedMap = new Map(earned.map((e) => [e.achievement_id, e.earned_at]));

  const result = allAchievements.map((a) => ({
    ...a,
    earned: earnedMap.has(a.id),
    earned_at: earnedMap.get(a.id) || null,
  }));

  return NextResponse.json({ achievements: result });
}
