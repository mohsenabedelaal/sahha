"use client";

import { useState } from "react";

interface MealCardProps {
  id: number;
  name: string;
  brand?: string | null;
  mealType: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  loggedAt: string;
  onDelete: (id: number) => void;
}

export function MealCard({
  id,
  name,
  brand,
  mealType,
  servings,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  onDelete,
}: MealCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/meals/log?id=${id}`, { method: "DELETE" });
      onDelete(id);
    } finally {
      setDeleting(false);
    }
  }

  const mealTypeEmoji: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-xl shrink-0">{mealTypeEmoji[mealType] ?? "🍽️"}</span>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted">
            {brand ? `${brand} · ` : ""}
            {servings !== 1 ? `${servings} × ` : ""}
            P {Math.round(protein_g)}g · C {Math.round(carbs_g)}g · F {Math.round(fat_g)}g
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-3 shrink-0">
        <span className="font-mono text-sm font-semibold text-mint">{Math.round(calories)} kcal</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-muted hover:text-red transition-colors disabled:opacity-50 text-lg leading-none"
          aria-label="Delete"
        >
          {deleting ? "·" : "×"}
        </button>
      </div>
    </div>
  );
}
