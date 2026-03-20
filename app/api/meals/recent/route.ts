import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mealLogs, foodItems } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // SQLite doesn't support DISTINCT ON, use GROUP BY with MAX
  const recent = await db
    .select({
      food_id: foodItems.id,
      name: foodItems.name,
      calories: foodItems.calories,
      protein_g: foodItems.protein_g,
      carbs_g: foodItems.carbs_g,
      fat_g: foodItems.fat_g,
      serving_size: foodItems.serving_size,
      logged_at: sql<string>`MAX(${mealLogs.logged_at})`.as("logged_at"),
    })
    .from(mealLogs)
    .innerJoin(foodItems, eq(mealLogs.food_item_id, foodItems.id))
    .where(eq(mealLogs.user_id, userId))
    .groupBy(foodItems.id)
    .orderBy(desc(sql`MAX(${mealLogs.logged_at})`))
    .limit(10);

  return NextResponse.json({ foods: recent });
}
