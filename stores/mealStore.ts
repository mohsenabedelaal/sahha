import { create } from "zustand";
import { offlineDb } from "@/lib/offline-db";

export interface MealEntry {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  servings: number;
  logged_at: string;
}

interface MealStore {
  meals: MealEntry[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  loading: boolean;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  setMeals: (meals: MealEntry[]) => void;
  recalculate: () => void;
  loadTodaysMeals: () => Promise<void>;
  logMeal: (meal: Omit<MealEntry, "id" | "logged_at">) => Promise<MealEntry | null>;
}

function calcTotals(meals: MealEntry[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export const useMealStore = create<MealStore>()((set, get) => ({
  meals: [],
  totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  loading: false,

  addMeal: (meal) => {
    const meals = [...get().meals, meal];
    set({ meals, totals: calcTotals(meals) });
  },

  removeMeal: (id) => {
    const meals = get().meals.filter((m) => m.id !== id);
    set({ meals, totals: calcTotals(meals) });
  },

  setMeals: (meals) => {
    set({ meals, totals: calcTotals(meals) });
  },

  recalculate: () => {
    set({ totals: calcTotals(get().meals) });
  },

  loadTodaysMeals: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/meals");
      if (!res.ok) return;
      const data = await res.json();
      const meals: MealEntry[] = (data.meals || []).map(
        (m: { id: number; food_name: string; meal_type: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; servings: number; logged_at: string }) => ({
          id: String(m.id),
          name: m.food_name || "Unknown",
          meal_type: m.meal_type,
          calories: m.calories,
          protein_g: m.protein_g,
          carbs_g: m.carbs_g,
          fat_g: m.fat_g,
          servings: m.servings,
          logged_at: m.logged_at,
        })
      );
      set({ meals, totals: calcTotals(meals), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  logMeal: async (meal) => {
    const now = new Date().toISOString();

    if (!navigator.onLine) {
      // Queue offline
      await offlineDb.mealLogs.add({
        food_name: meal.name,
        meal_type: meal.meal_type,
        servings: meal.servings,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        logged_at: now,
        synced: false,
      });
      const entry: MealEntry = {
        id: `offline-${Date.now()}`,
        ...meal,
        logged_at: now,
      };
      get().addMeal(entry);
      return entry;
    }

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_name: meal.name,
          meal_type: meal.meal_type,
          servings: meal.servings,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const entry: MealEntry = {
        id: String(data.meal.id),
        name: data.meal.food_name,
        meal_type: data.meal.meal_type,
        calories: data.meal.calories,
        protein_g: data.meal.protein_g,
        carbs_g: data.meal.carbs_g,
        fat_g: data.meal.fat_g,
        servings: data.meal.servings,
        logged_at: data.meal.logged_at,
      };
      get().addMeal(entry);
      return entry;
    } catch {
      return null;
    }
  },
}));
