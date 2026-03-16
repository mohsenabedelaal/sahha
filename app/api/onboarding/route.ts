import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateAllTargets } from "@/lib/calories";
import type { Sex, ActivityLevel, GoalType } from "@/lib/calories";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, sex, height_cm, weight_kg, activity_level, goal_type, diet_preference, allergies } = body;

    if (!name || !age || !sex || !height_cm || !weight_kg || !activity_level || !goal_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targets = calculateAllTargets(
      weight_kg,
      height_cm,
      age,
      sex as Sex,
      activity_level as ActivityLevel,
      goal_type as GoalType,
    );

    await db
      .update(users)
      .set({
        name,
        age,
        sex,
        height_cm,
        weight_kg,
        activity_level,
        goal_type,
        diet_preference: diet_preference || null,
        allergies: allergies || null,
        daily_calorie_target: targets.daily_calorie_target,
        protein_target_g: targets.protein_g,
        carbs_target_g: targets.carbs_g,
        fat_target_g: targets.fat_g,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, Number(session.user.id)));

    return NextResponse.json({ success: true, targets });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
