"use client";

import { useState, useEffect } from "react";
import { useMealStore } from "@/stores/mealStore";

export function WhyCard() {
  const { meals, totals } = useMealStore();
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");

  useEffect(() => {
    if (meals.length === 0) return;

    const lastMeal = meals[meals.length - 1];
    if (!lastMeal || lastMeal.name === foodName) return;

    setFoodName(lastMeal.name);
    setLoading(true);

    const context = `Today's totals: ${Math.round(totals.calories)} cal, ${Math.round(totals.protein_g)}g protein, ${Math.round(totals.carbs_g)}g carbs, ${Math.round(totals.fat_g)}g fat`;

    fetch("/api/nutrition/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName: lastMeal.name, nutritionContext: context }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.explanation) setExplanation(data.explanation);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meals, totals, foodName]);

  if (meals.length === 0 && !explanation) {
    return (
      <div
        className="rounded-[14px] px-4 py-3.5"
        style={{
          background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(167,139,250,0.04))",
          border: "1px solid rgba(56,189,248,0.12)",
        }}
      >
        <p className="text-[12px] font-bold text-sky mb-[5px] flex items-center gap-[5px]">
          💡 Why this food?
        </p>
        <p className="text-[11px] text-tx2 leading-[1.65]">
          Log your first meal to get personalized AI nutrition insights!
        </p>
        <div className="inline-flex items-center gap-1 text-[9px] font-bold py-[3px] px-2 rounded-[5px] bg-violet-d text-violet mt-2">
          ✨ Powered by Claude AI
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] px-4 py-3.5"
      style={{
        background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(167,139,250,0.04))",
        border: "1px solid rgba(56,189,248,0.12)",
      }}
    >
      <p className="text-[12px] font-bold text-sky mb-[5px] flex items-center gap-[5px]">
        💡 Why this food?
      </p>
      <p className="text-[11px] text-tx2 leading-[1.65]">
        {loading ? "Analyzing your meal..." : explanation || "Log a meal to get insights!"}
      </p>
      <div className="inline-flex items-center gap-1 text-[9px] font-bold py-[3px] px-2 rounded-[5px] bg-violet-d text-violet mt-2">
        ✨ Powered by Claude AI
      </div>
    </div>
  );
}
