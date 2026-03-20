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

export function RecentFoods({ onSelect }: RecentFoodsProps) {
  const [foods, setFoods] = useState<RecentFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meals/recent")
      .then((r) => r.ok ? r.json() : { foods: [] })
      .then((data) => setFoods(data.foods || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <span className="text-[12px] text-tx3">Loading recent foods...</span>
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-6 text-[12px] text-tx3">
        No recent foods yet. Start logging!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[7px]">
      {foods.map((food) => (
        <button
          key={food.food_id}
          onClick={() => onSelect(food)}
          className="flex items-center gap-[11px] px-3 py-[11px] bg-surface border border-border rounded-[10px] cursor-pointer transition-colors active:border-mint w-full text-left"
        >
          <div className="text-[22px] w-[38px] h-[38px] flex items-center justify-center bg-surface-2 rounded-[9px]">
            {getFoodEmoji(food.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{food.name}</div>
            <div className="text-[10px] text-tx2">{food.serving_size}</div>
          </div>
          <div className="text-[12px] font-bold text-mint bg-mint-d py-1 px-2.5 rounded-[7px]">
            {Math.round(food.calories)}
          </div>
        </button>
      ))}
    </div>
  );
}
