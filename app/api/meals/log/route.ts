import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodItems, mealLogs } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// ─── GET: fetch today's meal logs ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ?? new Date().toISOString().split("T")[0];

  // SQLite datetime format: 'YYYY-MM-DD HH:MM:SS'
  const dayStart = `${date} 00:00:00`;
  const dayEnd = `${date} 23:59:59`;

  const logs = await db
    .select({
      id: mealLogs.id,
      meal_type: mealLogs.meal_type,
      servings: mealLogs.servings,
      calories: mealLogs.calories,
      protein_g: mealLogs.protein_g,
      carbs_g: mealLogs.carbs_g,
      fat_g: mealLogs.fat_g,
      logged_at: mealLogs.logged_at,
      food_item_id: mealLogs.food_item_id,
      food_name: foodItems.name,
      food_brand: foodItems.brand,
      food_serving_size: foodItems.serving_size,
      food_serving_unit: foodItems.serving_unit,
    })
    .from(mealLogs)
    .leftJoin(foodItems, eq(mealLogs.food_item_id, foodItems.id))
    .where(
      and(
        eq(mealLogs.user_id, Number(session.user.id)),
        gte(mealLogs.logged_at, dayStart),
        lte(mealLogs.logged_at, dayEnd),
      ),
    );

  return NextResponse.json({ logs });
}

// ─── POST: create a new meal log ─────────────────────────────────────────────

interface LogPayload {
  food: {
    fatsecret_id?: string;
    name: string;
    brand?: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    serving_size: string;
    serving_unit?: string;
    source?: string;
  };
  meal_type: string;
  servings: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as LogPayload;
  const { food, meal_type, servings } = body;

  if (!food || !meal_type || servings == null) {
    return NextResponse.json({ error: "food, meal_type, servings required" }, { status: 400 });
  }

  const multiplier = servings;

  // Upsert food item into local cache (match by fatsecret_id if available, else name)
  let foodItemId: number;

  if (food.fatsecret_id) {
    const existing = await db
      .select({ id: foodItems.id })
      .from(foodItems)
      .where(eq(foodItems.fatsecret_id, food.fatsecret_id))
      .limit(1);

    if (existing.length > 0) {
      foodItemId = existing[0].id;
    } else {
      const inserted = await db
        .insert(foodItems)
        .values({
          fatsecret_id: food.fatsecret_id,
          name: food.name,
          brand: food.brand ?? null,
          calories: food.calories,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          fiber_g: food.fiber_g ?? 0,
          serving_size: food.serving_size,
          serving_unit: food.serving_unit ?? null,
          source: food.source ?? "fatsecret",
        })
        .returning({ id: foodItems.id });
      foodItemId = inserted[0].id;
    }
  } else {
    const inserted = await db
      .insert(foodItems)
      .values({
        name: food.name,
        brand: food.brand ?? null,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        fiber_g: food.fiber_g ?? 0,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit ?? null,
        source: food.source ?? "claude",
      })
      .returning({ id: foodItems.id });
    foodItemId = inserted[0].id;
  }

  // Insert the meal log with per-serving nutrition × servings
  const [log] = await db
    .insert(mealLogs)
    .values({
      user_id: Number(session.user.id),
      food_item_id: foodItemId,
      meal_type,
      servings,
      calories: food.calories * multiplier,
      protein_g: food.protein_g * multiplier,
      carbs_g: food.carbs_g * multiplier,
      fat_g: food.fat_g * multiplier,
    })
    .returning();

  return NextResponse.json({ log }, { status: 201 });
}

// ─── DELETE: remove a meal log ───────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  await db
    .delete(mealLogs)
    .where(
      and(
        eq(mealLogs.id, Number(id)),
        eq(mealLogs.user_id, Number(session.user.id)),
      ),
    );

  return NextResponse.json({ ok: true });
}
