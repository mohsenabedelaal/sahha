"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NutritionInfo } from "@/lib/api/types";

interface FoodConfirmationProps {
  food: {
    name: string;
    nutrition: NutritionInfo;
  };
  onConfirm: (data: {
    name: string;
    meal_type: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) => void;
  onCancel: () => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", emoji: "☀️" },
  { value: "lunch", label: "Lunch", emoji: "🌤️" },
  { value: "snack", label: "Snack", emoji: "🍎" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
];

export function FoodConfirmation({ food, onConfirm, onCancel }: FoodConfirmationProps) {
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 17) return "snack";
    return "dinner";
  });

  const cal = Math.round(food.nutrition.calories * servings);
  const protein = Math.round(food.nutrition.protein_g * servings * 10) / 10;
  const carbs = Math.round(food.nutrition.carbs_g * servings * 10) / 10;
  const fat = Math.round(food.nutrition.fat_g * servings * 10) / 10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
        onClick={onCancel}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface rounded-t-[20px] border-t border-border p-5 pb-8"
        >
          <div className="w-10 h-1 bg-surface-3 rounded-full mx-auto mb-4" />

          <h3 className="text-[17px] font-extrabold mb-1">{food.name}</h3>
          <p className="text-[11px] text-tx2 mb-4">
            {food.nutrition.serving_size}
          </p>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <MacroBox label="Calories" value={cal} unit="kcal" color="var(--mint)" />
            <MacroBox label="Protein" value={protein} unit="g" color="var(--sky)" />
            <MacroBox label="Carbs" value={carbs} unit="g" color="var(--amber)" />
            <MacroBox label="Fat" value={fat} unit="g" color="var(--violet)" />
          </div>

          {/* Servings */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold">Servings</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[16px] font-bold"
              >
                −
              </button>
              <span className="text-[16px] font-bold w-8 text-center">{servings}</span>
              <button
                onClick={() => setServings(servings + 0.5)}
                className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[16px] font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Meal Type */}
          <div className="flex gap-2 mb-5">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-semibold border transition-colors ${
                  mealType === mt.value
                    ? "bg-mint-d border-mint text-mint"
                    : "bg-surface-2 border-border text-tx2"
                }`}
              >
                {mt.emoji} {mt.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-surface-2 border border-border text-[13px] font-semibold text-tx2"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onConfirm({
                  name: food.name,
                  meal_type: mealType,
                  servings,
                  calories: cal,
                  protein_g: protein,
                  carbs_g: carbs,
                  fat_g: fat,
                })
              }
              className="flex-[2] py-3 rounded-xl bg-mint text-background text-[13px] font-bold"
            >
              Log {cal} kcal
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MacroBox({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-2 text-center">
      <div className="text-[14px] font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-tx3">{unit}</div>
      <div className="text-[9px] text-tx2">{label}</div>
    </div>
  );
}
