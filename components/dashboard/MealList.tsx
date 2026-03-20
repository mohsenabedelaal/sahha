"use client";

import Link from "next/link";
import { useMealStore, type MealEntry } from "@/stores/mealStore";

const MEAL_TYPE_CONFIG: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: "🥣", label: "Breakfast" },
  lunch: { emoji: "🥗", label: "Lunch" },
  snack: { emoji: "🍎", label: "Snack" },
  dinner: { emoji: "🌙", label: "Dinner" },
};

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

export function MealList() {
  const { meals } = useMealStore();

  // Group meals by type
  const grouped: Record<string, MealEntry[]> = {};
  for (const meal of meals) {
    if (!grouped[meal.meal_type]) grouped[meal.meal_type] = [];
    grouped[meal.meal_type].push(meal);
  }

  return (
    <div>
      <div className="flex justify-between items-center px-1 mb-1.5">
        <span className="text-[15px] font-bold">Today&apos;s Meals</span>
        <Link href="/log" className="text-[11px] text-mint font-semibold">
          + Log →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {MEAL_ORDER.map((type) => {
          const config = MEAL_TYPE_CONFIG[type];
          const typeMeals = grouped[type];
          const logged = typeMeals && typeMeals.length > 0;
          const totalKcal = logged
            ? typeMeals.reduce((sum, m) => sum + m.calories, 0)
            : 0;
          const description = logged
            ? typeMeals.map((m) => m.name).join(", ")
            : "Tap to log →";

          return (
            <Link
              key={type}
              href="/log"
              className={`rounded-[14px] bg-surface border border-border px-3.5 py-3 flex items-center gap-3 transition-colors active:border-mint active:bg-surface-2 ${
                !logged ? "border-dashed opacity-55" : ""
              }`}
            >
              <div className="text-[28px] w-[44px] h-[44px] flex items-center justify-center bg-surface-2 rounded-[11px]">
                {config.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">{config.label}</p>
                <p className={`text-[11px] truncate ${!logged ? "text-mint" : "text-tx2"}`}>
                  {description}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-[14px] font-extrabold ${logged ? "text-mint" : "text-tx3"}`}>
                  {logged ? Math.round(totalKcal) : "—"}
                </div>
                {logged && <div className="text-[10px] text-tx2 font-medium">kcal</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
