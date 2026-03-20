import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealPlanItems, foodItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSimilarRecipes } from "@/lib/api/spoonacular";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planItemId, newRecipeId } = body as { planItemId: number; newRecipeId?: number };

  // Get current plan item
  const [item] = await db
    .select({
      id: mealPlanItems.id,
      food_item_id: mealPlanItems.food_item_id,
      external_id: foodItems.external_id,
    })
    .from(mealPlanItems)
    .innerJoin(foodItems, eq(mealPlanItems.food_item_id, foodItems.id))
    .where(eq(mealPlanItems.id, planItemId))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Plan item not found" }, { status: 404 });
  }

  if (!newRecipeId) {
    // Return alternatives
    const recipeId = Number(item.external_id) || 0;
    const similar = await getSimilarRecipes(recipeId);
    return NextResponse.json({ alternatives: similar });
  }

  // Swap: find or create food item for new recipe
  let [existing] = await db
    .select({ id: foodItems.id })
    .from(foodItems)
    .where(eq(foodItems.external_id, String(newRecipeId)))
    .limit(1);

  if (existing) {
    await db
      .update(mealPlanItems)
      .set({ food_item_id: existing.id })
      .where(eq(mealPlanItems.id, planItemId));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Recipe not found in database" }, { status: 404 });
}
