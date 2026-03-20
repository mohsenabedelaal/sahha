import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, mealLogs, userAchievements } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [user] = await db
    .select({
      xp: users.xp,
      level: users.level,
      streak_days: users.streak_days,
      best_streak: users.best_streak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [logCount] = await db
    .select({ total: count() })
    .from(mealLogs)
    .where(eq(mealLogs.user_id, userId));

  const [badgeCount] = await db
    .select({ total: count() })
    .from(userAchievements)
    .where(eq(userAchievements.user_id, userId));

  return NextResponse.json({
    ...user,
    total_logs: logCount?.total || 0,
    badges_earned: badgeCount?.total || 0,
  });
}
