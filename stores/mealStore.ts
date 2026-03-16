import { create } from "zustand";

interface MealEntry {
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
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  setMeals: (meals: MealEntry[]) => void;
  recalculate: () => void;
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
}));
