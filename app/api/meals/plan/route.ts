import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealPlans, mealPlanItems, foodItems, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { searchFoods } from "@/lib/api/fatsecret";

// ─── Predefined healthy meal suggestions per slot ─────────────────────────────

const MEAL_SUGGESTIONS: Record<string, string[]> = {
  breakfast: ["oatmeal", "Greek yogurt with berries", "scrambled eggs", "whole wheat toast", "banana smoothie", "granola", "avocado toast"],
  lunch: ["grilled chicken salad", "lentil soup", "turkey sandwich", "quinoa bowl", "vegetable stir fry", "tuna wrap", "minestrone soup"],
  dinner: ["grilled salmon", "chicken breast", "pasta with marinara", "beef stir fry", "baked cod", "vegetable curry", "grilled turkey"],
  snack: ["apple", "almonds", "Greek yogurt", "banana", "mixed nuts", "carrot sticks", "hummus"],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── GET ──────────────────────────────────────────────────────────────────────

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
    return NextResponse.json({ plan: null, items: [] });
  }

  const items = await db
    .select({
      id: mealPlanItems.id,
      meal_type: mealPlanItems.meal_type,
      servings: mealPlanItems.servings,
      day_of_week: mealPlanItems.day_of_week,
      food_id: foodItems.id,
      food_name: foodItems.name,
      calories: foodItems.calories,
      protein_g: foodItems.protein_g,
      carbs_g: foodItems.carbs_g,
      fat_g: foodItems.fat_g,
      image_url: foodItems.image_url,
      external_id: foodItems.external_id,
    })
    .from(mealPlanItems)
    .innerJoin(foodItems, eq(mealPlanItems.food_item_id, foodItems.id))
    .where(eq(mealPlanItems.meal_plan_id, activePlan.id))
    .orderBy(mealPlanItems.day_of_week, mealPlanItems.meal_type);

  return NextResponse.json({ plan: activePlan, items });
}

// ─── POST — generate a FatSecret-powered 7-day plan ──────────────────────────

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Get user preferences
  const [user] = await db
    .select({ daily_calorie_target: users.daily_calorie_target, diet_preference: users.diet_preference })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const targetCalories = user?.daily_calorie_target || 2000;

  // Deactivate old plans
  await db
    .update(mealPlans)
    .set({ is_active: false })
    .where(and(eq(mealPlans.user_id, userId), eq(mealPlans.is_active, true)));

  const today = new Date();
  const jsDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((jsDay + 6) % 7));
  const weekStart = monday.toISOString().split("T")[0];

  const [plan] = await db
    .insert(mealPlans)
    .values({
      user_id: userId,
      name: `Week of ${weekStart}`,
      description: `${targetCalories} kcal/day target`,
      total_calories: targetCalories,
      is_active: true,
      week_start_date: weekStart,
    })
    .returning();

  // Build 7 days × 4 meal types using shuffled FatSecret suggestions
  const shuffled = {
    breakfast: shuffle(MEAL_SUGGESTIONS.breakfast),
    lunch: shuffle(MEAL_SUGGESTIONS.lunch),
    dinner: shuffle(MEAL_SUGGESTIONS.dinner),
    snack: shuffle(MEAL_SUGGESTIONS.snack),
  };

  for (let day = 0; day < 7; day++) {
    for (const mealType of ["breakfast", "lunch", "dinner", "snack"] as const) {
      const query = shuffled[mealType][day % shuffled[mealType].length];

      try {
        const results = await searchFoods(query, 1);
        if (results.length === 0) continue;

        const food = results[0];

        // Upsert food item
        let [existing] = await db
          .select({ id: foodItems.id })
          .from(foodItems)
          .where(eq(foodItems.fatsecret_id, food.id))
          .limit(1);

        let foodItemId: number;
        if (existing) {
          foodItemId = existing.id;
        } else {
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
          foodItemId = newFood.id;
        }

        await db.insert(mealPlanItems).values({
          meal_plan_id: plan.id,
          food_item_id: foodItemId,
          meal_type: mealType,
          servings: 1,
          day_of_week: day,
        });
      } catch {
        // Skip failed items and continue
      }
    }
  }

  return NextResponse.json({ plan, message: "Plan generated" }, { status: 201 });
}

// ─── DELETE — remove a plan item ─────────────────────────────────────────────

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
