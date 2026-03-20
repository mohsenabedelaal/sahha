import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(session.user.id);
  const body = await req.json();
  const { servings, calories, protein_g, carbs_g, fat_g } = body as {
    servings?: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  };

  const updates: Record<string, number> = {};
  if (servings !== undefined) updates.servings = servings;
  if (calories !== undefined) updates.calories = calories;
  if (protein_g !== undefined) updates.protein_g = protein_g;
  if (carbs_g !== undefined) updates.carbs_g = carbs_g;
  if (fat_g !== undefined) updates.fat_g = fat_g;

  const [updated] = await db
    .update(mealLogs)
    .set(updates)
    .where(and(eq(mealLogs.id, Number(id)), eq(mealLogs.user_id, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ meal: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(session.user.id);

  const [deleted] = await db
    .delete(mealLogs)
    .where(and(eq(mealLogs.id, Number(id)), eq(mealLogs.user_id, userId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
