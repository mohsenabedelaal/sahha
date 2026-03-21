"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodSearch } from "@/components/log/FoodSearch";
import { PhotoCapture } from "@/components/log/PhotoCapture";
import { BarcodeScanner } from "@/components/log/BarcodeScanner";
import { VoiceInput } from "@/components/log/VoiceInput";
import { FoodConfirmation } from "@/components/log/FoodConfirmation";
import { ManualEntryModal } from "@/components/log/ManualEntryModal";
import { RecentFoods } from "@/components/log/RecentFoods";
import { useMealStore } from "@/stores/mealStore";
import type { FoodSearchResult, FoodRecognitionResult, ParsedFood, NutritionInfo } from "@/lib/api/types";

interface PendingFood {
  name: string;
  nutrition: NutritionInfo;
}

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "short", day: "numeric",
});

export default function LogPage() {
  const [pendingFood, setPendingFood] = useState<PendingFood | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [recentKey, setRecentKey] = useState(0);
  const { logMeal } = useMealStore();

  function handleSearchSelect(food: FoodSearchResult) {
    setPendingFood({ name: food.name, nutrition: food.nutrition });
  }

  function handlePhotoResults(foods: FoodRecognitionResult[]) {
    if (foods.length > 0) {
      setPendingFood({ name: foods[0].name, nutrition: foods[0].nutrition });
    }
  }

  function handleBarcodeResult(food: FoodSearchResult) {
    setPendingFood({ name: food.name, nutrition: food.nutrition });
  }

  function handleVoiceResults(foods: ParsedFood[]) {
    if (foods.length > 0) {
      setPendingFood({ name: foods[0].name, nutrition: foods[0].nutrition });
    }
  }

  function handleRecentSelect(food: {
    name: string; calories: number; protein_g: number;
    carbs_g: number; fat_g: number; serving_size: string;
  }) {
    setPendingFood({
      name: food.name,
      nutrition: {
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        serving_size: food.serving_size,
      },
    });
  }

  async function handleConfirm(data: {
    name: string; meal_type: string; servings: number;
    calories: number; protein_g: number; carbs_g: number; fat_g: number;
  }) {
    setPendingFood(null);
    const result = await logMeal(data);
    if (result) {
      setSuccessMsg(`${data.name} logged · ${data.calories} kcal`);
      setRecentKey((k) => k + 1);
      setTimeout(() => setSuccessMsg(""), 3500);
    }
  }

  return (
    <div className="py-4 px-4 flex flex-col gap-5 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Log a Meal</h1>
        <p className="text-[12px] text-tx3 mt-0.5">{TODAY}</p>
      </div>

      {/* Search */}
      <FoodSearch onSelect={handleSearchSelect} />

      {/* Add Methods */}
      <div>
        <p className="text-[10px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono mb-2.5">
          Other ways to log
        </p>
        <div className="grid grid-cols-4 gap-2">
          <PhotoCapture onResults={handlePhotoResults} />
          <BarcodeScanner onResult={handleBarcodeResult} />
          <VoiceInput onResults={handleVoiceResults} />
          <button
            onClick={() => setShowManualEntry(true)}
            className="bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all active:border-mint/50 active:bg-surface-2 active:scale-[0.97]"
          >
            <div className="w-10 h-10 rounded-xl bg-mint-d flex items-center justify-center">
              <svg className="text-mint" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </div>
            <span className="text-[12px] font-bold">Manual</span>
            <span className="text-[9px] text-tx3 text-center leading-tight">Enter nutrition<br />manually</span>
            <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded bg-mint-d text-mint">
              Custom
            </span>
          </button>
        </div>
      </div>

      {/* Recent Foods */}
      <div>
        <p className="text-[10px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono mb-2.5">
          Recent Foods
        </p>
        <RecentFoods onSelect={handleRecentSelect} refreshKey={recentKey} />
      </div>

      {/* Confirmation Modal */}
      {pendingFood && pendingFood.name && (
        <FoodConfirmation
          food={pendingFood}
          onConfirm={handleConfirm}
          onCancel={() => setPendingFood(null)}
        />
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryModal
          onConfirm={(data) => {
            setShowManualEntry(false);
            handleConfirm(data);
          }}
          onCancel={() => setShowManualEntry(false)}
        />
      )}

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 bg-surface border border-[rgba(52,211,153,0.25)] rounded-2xl px-4 py-3.5 shadow-lg"
          >
            <div className="w-7 h-7 rounded-full bg-mint-d flex items-center justify-center shrink-0">
              <svg className="text-mint" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-[12px] font-semibold text-foreground flex-1">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
