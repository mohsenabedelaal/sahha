import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealPlanItems, foodItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { searchFoods } from "@/lib/api/fatsecret";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planItemId, newFoodId } = body as { planItemId: number; newFoodId?: string };

  // Get current plan item
  const [item] = await db
    .select({
      id: mealPlanItems.id,
      food_item_id: mealPlanItems.food_item_id,
      meal_type: mealPlanItems.meal_type,
      food_name: foodItems.name,
    })
    .from(mealPlanItems)
    .innerJoin(foodItems, eq(mealPlanItems.food_item_id, foodItems.id))
    .where(eq(mealPlanItems.id, planItemId))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Plan item not found" }, { status: 404 });
  }

  if (!newFoodId) {
    // Return alternatives from FatSecret using the current food name as query
    const alternatives = await searchFoods(item.food_name, 6);
    return NextResponse.json({
      alternatives: alternatives.map((f) => ({
        id: f.id,
        title: f.name,
        brand: f.brand,
        calories: Math.round(f.nutrition.calories),
        protein_g: Math.round(f.nutrition.protein_g),
        carbs_g: Math.round(f.nutrition.carbs_g),
        fat_g: Math.round(f.nutrition.fat_g),
        serving_size: f.nutrition.serving_size,
      })),
    });
  }

  // Swap: upsert the new food and update plan item
  const [existingFood] = await db
    .select({ id: foodItems.id })
    .from(foodItems)
    .where(eq(foodItems.fatsecret_id, newFoodId))
    .limit(1);

  if (existingFood) {
    await db
      .update(mealPlanItems)
      .set({ food_item_id: existingFood.id })
      .where(eq(mealPlanItems.id, planItemId));
    return NextResponse.json({ success: true });
  }

  // Food not cached yet — look it up from FatSecret and cache it
  const foods = await searchFoods(newFoodId, 1);
  if (foods.length === 0) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  const food = foods[0];
  const [newFood] = await db
    .insert(foodItems)
    .values({
      fatsecret_id: food.id,
      name: food.name,
      brand: food.brand ?? null,
      calories: food.nutrition.calories,
      protein_g: food.nutrition.protein_g,
      carbs_g: food.nutrition.carbs_g,
      fat_g: food.nutrition.fat_g,
      fiber_g: food.nutrition.fiber_g ?? 0,
      serving_size: food.nutrition.serving_size,
      source: "fatsecret",
    })
    .returning({ id: foodItems.id });

  await db
    .update(mealPlanItems)
    .set({ food_item_id: newFood.id })
    .where(eq(mealPlanItems.id, planItemId));

  return NextResponse.json({ success: true });
}
