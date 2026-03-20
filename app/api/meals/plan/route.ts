import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealPlans, mealPlanItems, foodItems, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateDayPlan } from "@/lib/api/spoonacular";

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
    return NextResponse.json({ plan: null });
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Get user's calorie target and diet preference
  const [user] = await db
    .select({
      daily_calorie_target: users.daily_calorie_target,
      diet_preference: users.diet_preference,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const targetCalories = user?.daily_calorie_target || 2000;
  const diet = mapDietPreference(user?.diet_preference);

  // Deactivate old plans
  await db
    .update(mealPlans)
    .set({ is_active: false })
    .where(and(eq(mealPlans.user_id, userId), eq(mealPlans.is_active, true)));

  // Generate 7-day plan
  const weekDays: Array<Awaited<ReturnType<typeof generateDayPlan>>> = [];
  for (let i = 0; i < 7; i++) {
    const dayPlan = await generateDayPlan(targetCalories, diet);
    weekDays.push(dayPlan);
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const weekStart = monday.toISOString().split("T")[0];

  const totalCalories = Math.round(
    weekDays.reduce((s, d) => s + d.totals.calories, 0) / 7
  );

  const [plan] = await db
    .insert(mealPlans)
    .values({
      user_id: userId,
      name: `Week of ${weekStart}`,
      description: `${targetCalories} kcal/day target`,
      total_calories: totalCalories,
      is_active: true,
      week_start_date: weekStart,
    })
    .returning();

  // Insert food items and plan items
  for (let dayIndex = 0; dayIndex < weekDays.length; dayIndex++) {
    const day = weekDays[dayIndex];
    for (const meal of day.meals) {
      // Upsert food item
      let [existing] = await db
        .select({ id: foodItems.id })
        .from(foodItems)
        .where(eq(foodItems.external_id, String(meal.id)))
        .limit(1);

      let foodItemId: number;
      if (existing) {
        foodItemId = existing.id;
      } else {
        const [newFood] = await db
          .insert(foodItems)
          .values({
            name: meal.title,
            calories: meal.calories,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            serving_size: `${meal.servings} servings`,
            source: "spoonacular",
            external_id: String(meal.id),
            image_url: meal.image,
          })
          .returning({ id: foodItems.id });
        foodItemId = newFood.id;
      }

      await db.insert(mealPlanItems).values({
        meal_plan_id: plan.id,
        food_item_id: foodItemId,
        meal_type: meal.meal_type,
        servings: 1,
        day_of_week: dayIndex,
      });
    }
  }

  return NextResponse.json({ plan, message: "Plan generated" }, { status: 201 });
}

function mapDietPreference(pref?: string | null): string | undefined {
  if (!pref) return undefined;
  const map: Record<string, string> = {
    vegetarian: "vegetarian",
    vegan: "vegan",
    "gluten-free": "gluten free",
    keto: "ketogenic",
    paleo: "paleo",
  };
  return map[pref.toLowerCase()] || undefined;
}
