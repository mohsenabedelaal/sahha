import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      diet_preference: users.diet_preference,
      goal_type: users.goal_type,
      daily_calorie_target: users.daily_calorie_target,
    })
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1);

  return NextResponse.json({ preferences: user || {} });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.diet_preference !== undefined) updates.diet_preference = body.diet_preference;
  if (body.goal_type !== undefined) updates.goal_type = body.goal_type;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, Number(session.user.id)));

  return NextResponse.json({ success: true });
}
