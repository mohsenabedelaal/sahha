"use client";

import { useState } from "react";
import { FoodSearch } from "@/components/log/FoodSearch";
import { PhotoCapture } from "@/components/log/PhotoCapture";
import { BarcodeScanner } from "@/components/log/BarcodeScanner";
import { VoiceInput } from "@/components/log/VoiceInput";
import { FoodConfirmation } from "@/components/log/FoodConfirmation";
import { RecentFoods } from "@/components/log/RecentFoods";
import { useMealStore } from "@/stores/mealStore";
import type { FoodSearchResult, FoodRecognitionResult, ParsedFood, NutritionInfo } from "@/lib/api/types";

interface PendingFood {
  name: string;
  nutrition: NutritionInfo;
}

export default function LogPage() {
  const [pendingFood, setPendingFood] = useState<PendingFood | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
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

  function handleRecentSelect(food: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; serving_size: string }) {
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
    name: string;
    meal_type: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) {
    setPendingFood(null);
    const result = await logMeal(data);
    if (result) {
      setSuccessMsg(`Logged ${data.name} (${data.calories} kcal)`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  return (
    <div className="py-4 px-4 flex flex-col gap-3.5">
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Log a Meal</h1>

      {successMsg && (
        <div className="bg-mint-d border border-[rgba(52,211,153,0.2)] rounded-xl px-4 py-2.5 text-[12px] font-semibold text-mint text-center">
          ✓ {successMsg}
        </div>
      )}

      {/* Search */}
      <FoodSearch onSelect={handleSearchSelect} />

      {/* Add Methods Grid */}
      <div className="grid grid-cols-2 gap-2">
        <PhotoCapture onResults={handlePhotoResults} />
        <BarcodeScanner onResult={handleBarcodeResult} />
        <VoiceInput onResults={handleVoiceResults} />
        <button
          onClick={() =>
            setPendingFood({
              name: "",
              nutrition: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_size: "1 serving" },
            })
          }
          className="bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all active:border-mint active:bg-surface-2 active:scale-[0.97]"
        >
          <span className="text-[26px]">✏️</span>
          <span className="text-[12px] font-bold">Manual Entry</span>
          <span className="text-[10px] text-tx2 text-center">Search 2.3M+ foods</span>
          <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded mt-0.5 bg-mint-d text-mint">
            FatSecret DB
          </span>
        </button>
      </div>

      {/* Recent Foods */}
      <div className="text-[11px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono">
        Recent Foods
      </div>
      <RecentFoods onSelect={handleRecentSelect} />

      {/* Confirmation Modal */}
      {pendingFood && pendingFood.name && (
        <FoodConfirmation
          food={pendingFood}
          onConfirm={handleConfirm}
          onCancel={() => setPendingFood(null)}
        />
      )}
    </div>
  );
}
