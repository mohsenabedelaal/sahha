import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodItems, mealPlans, mealPlanItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ─── GET: get the active meal plan with its items ────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [plan] = await db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.user_id, userId), eq(mealPlans.is_active, true)))
    .limit(1);

  if (!plan) {
    return NextResponse.json({ plan: null, items: [] });
  }

  const items = await db
    .select({
      id: mealPlanItems.id,
      meal_plan_id: mealPlanItems.meal_plan_id,
      food_item_id: mealPlanItems.food_item_id,
      meal_type: mealPlanItems.meal_type,
      servings: mealPlanItems.servings,
      day_of_week: mealPlanItems.day_of_week,
      food_name: foodItems.name,
      food_brand: foodItems.brand,
      food_calories: foodItems.calories,
      food_protein_g: foodItems.protein_g,
      food_carbs_g: foodItems.carbs_g,
      food_fat_g: foodItems.fat_g,
      food_serving_size: foodItems.serving_size,
      food_serving_unit: foodItems.serving_unit,
    })
    .from(mealPlanItems)
    .leftJoin(foodItems, eq(mealPlanItems.food_item_id, foodItems.id))
    .where(eq(mealPlanItems.meal_plan_id, plan.id));

  return NextResponse.json({ plan, items });
}

// ─── POST: add an item to the active plan (create plan if none) ──────────────

interface PlanItemPayload {
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
  day_of_week: number; // 0 = Monday … 6 = Sunday
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = (await req.json()) as PlanItemPayload;
  const { food, meal_type, servings, day_of_week } = body;

  if (!food || !meal_type || servings == null || day_of_week == null) {
    return NextResponse.json({ error: "food, meal_type, servings, day_of_week required" }, { status: 400 });
  }

  // Ensure active plan exists
  let [plan] = await db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.user_id, userId), eq(mealPlans.is_active, true)))
    .limit(1);

  if (!plan) {
    const [created] = await db
      .insert(mealPlans)
      .values({
        user_id: userId,
        name: "My Weekly Plan",
        is_active: true,
      })
      .returning();
    plan = created;
  }

  // Upsert food item
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
      const [ins] = await db
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
      foodItemId = ins.id;
    }
  } else {
    const [ins] = await db
      .insert(foodItems)
      .values({
        name: food.name,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        fiber_g: food.fiber_g ?? 0,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit ?? null,
        source: food.source ?? "manual",
      })
      .returning({ id: foodItems.id });
    foodItemId = ins.id;
  }

  const [item] = await db
    .insert(mealPlanItems)
    .values({
      meal_plan_id: plan.id,
      food_item_id: foodItemId,
      meal_type,
      servings,
      day_of_week,
    })
    .returning();

  return NextResponse.json({ item }, { status: 201 });
}

// ─── DELETE: remove an item from the meal plan ───────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  await db.delete(mealPlanItems).where(eq(mealPlanItems.id, Number(id)));

  return NextResponse.json({ ok: true });
}
