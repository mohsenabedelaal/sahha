"use client";

import { useState, useEffect, useCallback } from "react";
import { MealPlanCard } from "@/components/plan/MealPlanCard";
import { SwapModal } from "@/components/plan/SwapModal";
import { GroceryList } from "@/components/plan/GroceryList";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface PlanItem {
  id: number;
  meal_type: string;
  day_of_week: number | null;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url: string | null;
  external_id: string | null;
}

interface Plan {
  id: number;
  name: string;
  description: string | null;
  total_calories: number | null;
  week_start_date: string | null;
}

export default function PlanPage() {
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // Mon=0 ... Sun=6
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [swapItemId, setSwapItemId] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<Array<{ id: number; title: string }>>([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meals/plan");
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setItems(data.items || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  async function generatePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/meals/plan", { method: "POST" });
      if (res.ok) {
        await loadPlan();
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }

  async function handleSwap(planItemId: number) {
    setSwapItemId(planItemId);
    setSwapLoading(true);
    try {
      const res = await fetch("/api/meals/plan/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data.alternatives || []);
      }
    } catch {
      // ignore
    } finally {
      setSwapLoading(false);
    }
  }

  async function selectAlternative(recipeId: number) {
    if (!swapItemId) return;
    await fetch("/api/meals/plan/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planItemId: swapItemId, newRecipeId: recipeId }),
    });
    setSwapItemId(null);
    await loadPlan();
  }

  const dayItems = items.filter((i) => i.day_of_week === activeDay);
  const dayTotals = dayItems.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein_g: acc.protein_g + i.protein_g,
      carbs_g: acc.carbs_g + i.carbs_g,
      fat_g: acc.fat_g + i.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted">Loading plan...</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-4 flex flex-col gap-3.5">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Meal Plan</h1>
        <p className="text-[12px] text-tx2">
          {plan ? plan.name : "No active plan"} ·{" "}
          <span className="text-[8px] font-bold font-mono bg-amber-d text-amber py-[2px] px-[7px] rounded">
            Spoonacular API
          </span>
        </p>
      </div>

      {!plan ? (
        // Empty state
        <div className="text-center py-12">
          <div className="text-[48px] mb-3">📋</div>
          <p className="text-[15px] font-bold mb-2">No Meal Plan Yet</p>
          <p className="text-[12px] text-tx2 mb-5">
            Generate a personalized weekly meal plan based on your calorie goals.
          </p>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-mint text-background text-[13px] font-bold disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      ) : (
        <>
          {/* Day Tabs */}
          <div className="flex gap-[5px] overflow-x-auto scrollbar-hide">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setActiveDay(i)}
                className={`py-[7px] px-[13px] rounded-[9px] text-[12px] font-semibold whitespace-nowrap border transition-colors ${
                  i === activeDay
                    ? "bg-mint-d border-mint text-mint"
                    : "bg-surface border-border text-tx2"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meals */}
          {dayItems.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-tx3">
              No meals planned for this day.
            </div>
          ) : (
            dayItems.map((item) => (
              <MealPlanCard
                key={item.id}
                id={item.id}
                name={item.food_name}
                mealType={item.meal_type}
                calories={item.calories}
                protein_g={item.protein_g}
                carbs_g={item.carbs_g}
                fat_g={item.fat_g}
                imageUrl={item.image_url}
                onSwap={handleSwap}
              />
            ))
          )}

          {/* Daily Total */}
          {dayItems.length > 0 && (
            <div className="bg-surface border border-border rounded-[10px] py-3.5 text-center">
              <div className="text-[12px] font-bold">Daily Total</div>
              <div className="text-[22px] font-black text-mint my-[3px]">
                {Math.round(dayTotals.calories).toLocaleString()} kcal
              </div>
              <div className="text-[11px] text-tx2 font-mono">
                P:{Math.round(dayTotals.protein_g)}g · C:{Math.round(dayTotals.carbs_g)}g · F:{Math.round(dayTotals.fat_g)}g
              </div>
            </div>
          )}

          {/* Grocery Button */}
          <button
            onClick={() => setShowGrocery(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-mint-d border border-[rgba(52,211,153,0.18)] rounded-[14px] text-mint text-[13px] font-bold active:bg-[rgba(52,211,153,0.16)] transition-colors"
          >
            🛒 Generate Grocery List
          </button>

          {/* Re-generate */}
          <button
            onClick={generatePlan}
            disabled={generating}
            className="text-center text-[12px] text-tx2 font-semibold py-2 disabled:opacity-50"
          >
            {generating ? "Generating..." : "🔄 Regenerate Plan"}
          </button>
        </>
      )}

      <p className="text-center text-[9px] text-tx3">
        Recipes by Spoonacular · Nutrition data verified
      </p>

      {/* Swap Modal */}
      {swapItemId !== null && (
        <SwapModal
          alternatives={alternatives}
          loading={swapLoading}
          onSelect={selectAlternative}
          onClose={() => setSwapItemId(null)}
        />
      )}

      {/* Grocery List */}
      {showGrocery && <GroceryList onClose={() => setShowGrocery(false)} />}
    </div>
  );
}
