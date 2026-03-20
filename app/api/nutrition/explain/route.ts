import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { explainFood } from "@/lib/api/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { foodName, nutritionContext } = body as {
    foodName: string;
    nutritionContext: string;
  };

  if (!foodName) {
    return NextResponse.json({ error: "Food name is required" }, { status: 400 });
  }

  const [user] = await db
    .select({ goal_type: users.goal_type })
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1);

  const result = await explainFood(
    foodName,
    nutritionContext || "No additional context",
    user?.goal_type || undefined
  );

  return NextResponse.json(result);
}
