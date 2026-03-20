"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualEntryModalProps {
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

export function ManualEntryModal({ onConfirm, onCancel }: ManualEntryModalProps) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 17) return "snack";
    return "dinner";
  });

  const cal = Math.round((parseFloat(calories) || 0) * servings);
  const isValid = name.trim().length > 0 && (parseFloat(calories) || 0) > 0;

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
          className="w-full max-w-lg bg-surface rounded-t-[20px] border-t border-border p-5 pb-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-surface-3 rounded-full mx-auto mb-4" />
          <h3 className="text-[17px] font-extrabold mb-4">Manual Entry</h3>

          {/* Food Name */}
          <div className="mb-3">
            <label className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-1.5 block">
              Food Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grilled Chicken Breast"
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-[14px] placeholder:text-tx3 focus:outline-none focus:border-mint"
            />
          </div>

          {/* Nutrition fields */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-1.5 block">
                Calories (kcal) *
              </label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-[14px] placeholder:text-tx3 focus:outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-1.5 block">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-[14px] placeholder:text-tx3 focus:outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-1.5 block">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-[14px] placeholder:text-tx3 focus:outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-1.5 block">
                Fat (g)
              </label>
              <input
                type="number"
                min="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-[14px] placeholder:text-tx3 focus:outline-none focus:border-mint"
              />
            </div>
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
              disabled={!isValid}
              onClick={() =>
                onConfirm({
                  name: name.trim(),
                  meal_type: mealType,
                  servings,
                  calories: cal,
                  protein_g: Math.round((parseFloat(protein) || 0) * servings * 10) / 10,
                  carbs_g: Math.round((parseFloat(carbs) || 0) * servings * 10) / 10,
                  fat_g: Math.round((parseFloat(fat) || 0) * servings * 10) / 10,
                })
              }
              className="flex-[2] py-3 rounded-xl bg-mint text-background text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Log {cal} kcal
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
