import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealLogs, foodItems } from "@/lib/db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { awardXp, checkAchievements } from "@/lib/gamification-engine";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam || new Date().toISOString().split("T")[0];

  const meals = await db
    .select({
      id: mealLogs.id,
      meal_type: mealLogs.meal_type,
      servings: mealLogs.servings,
      calories: mealLogs.calories,
      protein_g: mealLogs.protein_g,
      carbs_g: mealLogs.carbs_g,
      fat_g: mealLogs.fat_g,
      logged_at: mealLogs.logged_at,
      food_name: foodItems.name,
      food_id: foodItems.id,
    })
    .from(mealLogs)
    .leftJoin(foodItems, eq(mealLogs.food_item_id, foodItems.id))
    .where(
      and(
        eq(mealLogs.user_id, userId),
        gte(mealLogs.logged_at, `${date} 00:00:00`),
        lt(mealLogs.logged_at, `${date}T23:59:59`)
      )
    )
    .orderBy(mealLogs.logged_at);

  return NextResponse.json({ meals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { food_name, meal_type, servings, calories, protein_g, carbs_g, fat_g, serving_size, barcode } = body as {
    food_name: string;
    meal_type: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    serving_size?: string;
    barcode?: string;
  };

  if (!food_name || !meal_type || !calories) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upsert food item
  let [existingFood] = await db
    .select({ id: foodItems.id })
    .from(foodItems)
    .where(eq(foodItems.name, food_name))
    .limit(1);

  let foodItemId: number;

  if (existingFood) {
    foodItemId = existingFood.id;
  } else {
    const [newFood] = await db
      .insert(foodItems)
      .values({
        name: food_name,
        calories: calories / (servings || 1),
        protein_g: protein_g / (servings || 1),
        carbs_g: carbs_g / (servings || 1),
        fat_g: fat_g / (servings || 1),
        serving_size: serving_size || "1 serving",
        barcode: barcode || null,
      })
      .returning({ id: foodItems.id });
    foodItemId = newFood.id;
  }

  const [mealLog] = await db
    .insert(mealLogs)
    .values({
      user_id: userId,
      food_item_id: foodItemId,
      meal_type,
      servings: servings || 1,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      logged_at: sql`(datetime('now'))`,
    })
    .returning();

  // Award XP for logging a meal
  const xpResult = await awardXp(userId, "log_meal");
  const newAchievements = await checkAchievements(userId, "log_meal");

  return NextResponse.json({
    meal: { ...mealLog, food_name },
    xp: xpResult,
    achievements: newAchievements,
  }, { status: 201 });
}
