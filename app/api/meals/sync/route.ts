import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealLogs, foodItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

interface OfflineMeal {
  food_name: string;
  meal_type: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { meals } = body as { meals: OfflineMeal[] };

  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    return NextResponse.json({ error: "No meals to sync" }, { status: 400 });
  }

  const synced: number[] = [];

  for (const meal of meals) {
    // Upsert food item
    let [existingFood] = await db
      .select({ id: foodItems.id })
      .from(foodItems)
      .where(eq(foodItems.name, meal.food_name))
      .limit(1);

    let foodItemId: number;
    if (existingFood) {
      foodItemId = existingFood.id;
    } else {
      const s = meal.servings || 1;
      const [newFood] = await db
        .insert(foodItems)
        .values({
          name: meal.food_name,
          calories: meal.calories / s,
          protein_g: meal.protein_g / s,
          carbs_g: meal.carbs_g / s,
          fat_g: meal.fat_g / s,
          serving_size: "1 serving",
        })
        .returning({ id: foodItems.id });
      foodItemId = newFood.id;
    }

    const [inserted] = await db
      .insert(mealLogs)
      .values({
        user_id: userId,
        food_item_id: foodItemId,
        meal_type: meal.meal_type,
        servings: meal.servings || 1,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        logged_at: meal.logged_at || sql`(datetime('now'))`,
      })
      .returning({ id: mealLogs.id });

    synced.push(inserted.id);
  }

  return NextResponse.json({ synced: synced.length, ids: synced });
}
