"use client";

import { useEffect, useState } from "react";

interface RecentFood {
  food_id: number;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;
}

interface RecentFoodsProps {
  onSelect: (food: RecentFood) => void;
  refreshKey?: number;
}

const FOOD_EMOJIS: Record<string, string> = {
  egg: "🍳", chicken: "🍗", rice: "🍚", bread: "🍞", toast: "🍞",
  banana: "🍌", apple: "🍎", salad: "🥗", oat: "🥣", fish: "🐟",
  salmon: "🐟", avocado: "🥑", peanut: "🥜", milk: "🥛", yogurt: "🫙",
  cheese: "🧀", pizza: "🍕", pasta: "🍝", beef: "🥩", steak: "🥩",
};

function getFoodEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

export function RecentFoods({ onSelect, refreshKey }: RecentFoodsProps) {
  const [foods, setFoods] = useState<RecentFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/meals/recent")
      .then((r) => r.ok ? r.json() : { foods: [] })
      .then((data) => setFoods(data.foods || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 bg-surface border border-border rounded-[12px]">
            <div className="w-9 h-9 rounded-lg bg-surface-3 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-3 rounded w-2/3 animate-pulse" />
              <div className="h-2.5 bg-surface-2 rounded w-1/3 animate-pulse" />
            </div>
            <div className="h-5 w-9 bg-surface-3 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-tx3" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-tx2">No recent foods</p>
        <p className="text-[11px] text-tx3 mt-0.5">Foods you log will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {foods.map((food) => (
        <button
          key={food.food_id}
          onClick={() => onSelect(food)}
          className="flex items-center gap-3 px-3 py-3 bg-surface border border-border rounded-[12px] cursor-pointer transition-all active:border-mint/50 active:bg-surface-2 w-full text-left"
        >
          <div className="text-[20px] w-9 h-9 flex items-center justify-center bg-surface-2 rounded-lg shrink-0">
            {getFoodEmoji(food.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{food.name}</div>
            <div className="flex gap-1.5 mt-1">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "var(--sky)", background: "var(--sky-d)" }}>
                P {Math.round(food.protein_g)}g
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "var(--amber)", background: "var(--amber-d)" }}>
                C {Math.round(food.carbs_g)}g
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "var(--violet)", background: "var(--violet-d)" }}>
                F {Math.round(food.fat_g)}g
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[13px] font-black" style={{ color: "var(--mint)" }}>
              {Math.round(food.calories)}
            </div>
            <div className="text-[9px] text-tx3">kcal</div>
          </div>
        </button>
      ))}
    </div>
  );
}
