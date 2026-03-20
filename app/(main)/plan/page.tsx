"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodSearch } from "@/components/meals/FoodSearch";
import type { FoodItem } from "@/lib/api/fatsecret";

// ─── Types ────────────────────────────────────────────────────────────────────

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface PlanItem {
  id: number;
  food_item_id: number | null;
  meal_type: string;
  servings: number;
  day_of_week: number;
  food_name: string | null;
  food_brand: string | null;
  food_calories: number | null;
  food_protein_g: number | null;
  food_carbs_g: number | null;
  food_fat_g: number | null;
  food_serving_size: string | null;
  food_serving_unit: string | null;
}

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const [activeDay, setActiveDay] = useState(0); // 0 = Monday
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSlot, setAddingSlot] = useState<{ day: number; mealType: MealType } | null>(null);
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [saving, setSaving] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meals/plan");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // Set current day as default active day
  useEffect(() => {
    const jsDay = new Date().getDay(); // 0 = Sunday
    const day = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0
    setActiveDay(day);
  }, []);

  async function addItem() {
    if (!addingSlot || !pendingFood) return;
    setSaving(true);

    try {
      const res = await fetch("/api/meals/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food: pendingFood,
          meal_type: addingSlot.mealType,
          servings: parseFloat(servings) || 1,
          day_of_week: addingSlot.day,
        }),
      });

      if (res.ok) {
        await loadPlan();
      }
    } finally {
      setSaving(false);
      setAddingSlot(null);
      setPendingFood(null);
      setServings("1");
    }
  }

  async function removeItem(id: number) {
    await fetch(`/api/meals/plan?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // Items for the active day
  const dayItems = items.filter((i) => i.day_of_week === activeDay);

  // Daily totals
  const dayCalories = dayItems.reduce((sum, i) => sum + (i.food_calories ?? 0) * i.servings, 0);
  const dayProtein = dayItems.reduce((sum, i) => sum + (i.food_protein_g ?? 0) * i.servings, 0);
  const dayCarbs = dayItems.reduce((sum, i) => sum + (i.food_carbs_g ?? 0) * i.servings, 0);
  const dayFat = dayItems.reduce((sum, i) => sum + (i.food_fat_g ?? 0) * i.servings, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Meal Plan</h1>

      {/* Day selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeDay === i
                ? "bg-mint text-background"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Daily summary */}
      {dayItems.length > 0 && (
        <Card className="flex flex-col gap-1">
          <h2 className="font-semibold text-sm text-muted mb-2">{DAYS[activeDay]} totals</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Calories</span>
            <span className="font-mono font-semibold text-mint">{Math.round(dayCalories)} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Protein</span>
            <span className="font-mono">{Math.round(dayProtein)}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Carbs</span>
            <span className="font-mono">{Math.round(dayCarbs)}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Fat</span>
            <span className="font-mono">{Math.round(dayFat)}g</span>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-muted text-sm text-center py-8">Loading plan...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {MEAL_TYPES.map((mealType) => {
            const slotItems = dayItems.filter((i) => i.meal_type === mealType);
            const isAdding = addingSlot?.day === activeDay && addingSlot?.mealType === mealType;

            return (
              <Card key={mealType} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">
                    {MEAL_EMOJI[mealType]} {mealType}
                  </h3>
                  {!isAdding && (
                    <button
                      onClick={() => {
                        setAddingSlot({ day: activeDay, mealType });
                        setPendingFood(null);
                        setServings("1");
                      }}
                      className="text-mint text-sm hover:text-mint/80 transition-colors"
                    >
                      + Add food
                    </button>
                  )}
                </div>

                {/* Existing items */}
                {slotItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.food_name}</p>
                      <p className="text-xs text-muted">
                        {item.servings !== 1 ? `${item.servings} × ` : ""}
                        {item.food_serving_size}{item.food_serving_unit ?? ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="font-mono text-sm text-mint">
                        {Math.round((item.food_calories ?? 0) * item.servings)} kcal
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted hover:text-red transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {slotItems.length === 0 && !isAdding && (
                  <p className="text-xs text-muted/50 text-center py-2">Nothing planned yet</p>
                )}

                {/* Add food form */}
                {isAdding && (
                  <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-3">
                    <FoodSearch
                      placeholder={`Search for ${mealType}...`}
                      onSelect={(food) => setPendingFood(food)}
                    />

                    {pendingFood && (
                      <>
                        <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{pendingFood.name}</p>
                            {pendingFood.brand && (
                              <p className="text-xs text-muted">{pendingFood.brand}</p>
                            )}
                          </div>
                          <p className="font-mono text-sm text-mint">
                            {Math.round(pendingFood.calories)} kcal
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-sm text-muted w-16 shrink-0">Servings</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            className="w-20 rounded-xl bg-surface px-3 py-2 text-sm border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none"
                          />
                          <p className="text-xs text-muted">
                            = {Math.round(pendingFood.calories * (parseFloat(servings) || 1))} kcal
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={addItem} loading={saving} size="sm" className="flex-1">
                            Add to plan
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setAddingSlot(null);
                              setPendingFood(null);
                            }}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}

                    {!pendingFood && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAddingSlot(null);
                          setPendingFood(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
