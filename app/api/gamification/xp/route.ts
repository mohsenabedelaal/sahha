import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { awardXp, checkAchievements } from "@/lib/gamification-engine";
import { XP_REWARDS } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body as { action: string };

  if (!action || !(action in XP_REWARDS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const userId = Number(session.user.id);
  const xpResult = await awardXp(userId, action as keyof typeof XP_REWARDS);
  const newAchievements = await checkAchievements(userId, action as keyof typeof XP_REWARDS);

  return NextResponse.json({ ...xpResult, newAchievements });
}
