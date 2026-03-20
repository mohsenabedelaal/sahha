import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealPlans, mealPlanItems, foodItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [activePlan] = await db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.user_id, userId), eq(mealPlans.is_active, true)))
    .limit(1);

  if (!activePlan) {
    return NextResponse.json({ items: [] });
  }

  const items = await db
    .select({
      name: foodItems.name,
      servings: mealPlanItems.servings,
      category: foodItems.category,
    })
    .from(mealPlanItems)
    .innerJoin(foodItems, eq(mealPlanItems.food_item_id, foodItems.id))
    .where(eq(mealPlanItems.meal_plan_id, activePlan.id));

  // Aggregate by food name
  const aggregated: Record<string, { name: string; count: number; category: string | null }> = {};
  for (const item of items) {
    if (aggregated[item.name]) {
      aggregated[item.name].count += item.servings;
    } else {
      aggregated[item.name] = { name: item.name, count: item.servings, category: item.category };
    }
  }

  return NextResponse.json({
    items: Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name)),
  });
}
