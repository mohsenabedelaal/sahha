"use client";

interface MealPlanCardProps {
  id: number;
  name: string;
  mealType: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  imageUrl?: string | null;
  onSwap: (id: number) => void;
}

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌤️",
  snack: "🍎",
  dinner: "🌙",
};

export function MealPlanCard({ id, name, mealType, calories, protein_g, carbs_g, fat_g, onSwap }: MealPlanCardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] font-bold text-tx2 uppercase tracking-[1px] flex items-center gap-[5px] font-mono">
        {MEAL_EMOJI[mealType] || "🍽️"} {mealType} · {Math.round(calories)} kcal
      </div>
      <div className="flex items-center gap-[11px] px-3 py-[11px] bg-surface border border-border rounded-[10px]">
        <div className="text-[22px] w-[38px] h-[38px] flex items-center justify-center bg-surface-2 rounded-[9px]">
          {MEAL_EMOJI[mealType] || "🍽️"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate">{name}</div>
          <div className="text-[10px] text-tx2 font-mono mt-[1px]">
            P:{Math.round(protein_g)}g · C:{Math.round(carbs_g)}g · F:{Math.round(fat_g)}g
          </div>
        </div>
        <button
          onClick={() => onSwap(id)}
          className="text-[10px] py-[5px] px-[9px] rounded-[6px] bg-surface-2 border border-border text-tx2 font-semibold whitespace-nowrap active:border-amber active:text-amber transition-colors"
        >
          Swap
        </button>
      </div>
    </div>
  );
}
